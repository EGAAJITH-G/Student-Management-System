const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Record daily student attendance
// @route   POST /api/attendance
// @access  Private (Admin, Staff)
exports.recordAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a date and records array'
      });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight for daily records consistency

    // Bulk-upsert each record to prevent double-marking
    const operations = records.map((rec) => {
      return Attendance.findOneAndUpdate(
        { student: rec.studentId, date: targetDate },
        {
          status: rec.status,
          recordedBy: req.user._id,
          student: rec.studentId,
          date: targetDate
        },
        { upsert: true, new: true, runValidators: true }
      );
    });

    await Promise.all(operations);

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while saving attendance: ' + error.message
    });
  }
};

// @desc    Get attendance records for a specific date
// @route   GET /api/attendance/daily
// @access  Private (Admin, Staff)
exports.getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Please specify a query date'
      });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({ date: targetDate }).populate(
      'student',
      'name email course phone profileImage'
    );

    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while fetching daily attendance: ' + error.message
    });
  }
};

// @desc    Generate monthly attendance report for all students
// @route   GET /api/attendance/monthly
// @access  Private (Admin, Staff, Student)
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Please provide month and year query parameters'
      });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    // Calculate month boundary in UTC
    const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0)); // Exclusive boundary (starts next month)

    // Aggregate enrollees attendance statistics
    const report = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: '$student',
          presentCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Present'] }, 1, 0]
            }
          },
          absentCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $project: {
          _id: 1,
          presentCount: 1,
          absentCount: 1,
          totalDays: { $add: ['$presentCount', '$absentCount'] },
          rate: {
            $cond: [
              { $eq: [{ $add: ['$presentCount', '$absentCount'] }, 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$presentCount', { $add: ['$presentCount', '$absentCount'] }] },
                  100
                ]
              }
            ]
          },
          student: {
            _id: '$studentInfo._id',
            name: '$studentInfo.name',
            email: '$studentInfo.email',
            course: '$studentInfo.course',
            phone: '$studentInfo.phone',
            profileImage: '$studentInfo.profileImage'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while generating monthly report: ' + error.message
    });
  }
};
