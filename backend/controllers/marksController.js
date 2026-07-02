const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { recordLog } = require('./auditLogController');

// Calculate Grade and Grade Points based on Total Marks (out of 100)
const calculateGradeDetails = (totalMarks) => {
  if (totalMarks >= 90) return { grade: 'O', gradePoints: 10 };
  if (totalMarks >= 80) return { grade: 'A+', gradePoints: 9 };
  if (totalMarks >= 70) return { grade: 'A', gradePoints: 8 };
  if (totalMarks >= 60) return { grade: 'B+', gradePoints: 7 };
  if (totalMarks >= 50) return { grade: 'B', gradePoints: 6 };
  if (totalMarks >= 40) return { grade: 'C', gradePoints: 5 };
  return { grade: 'F', gradePoints: 0 };
};

// @desc    Save or Update a subject marks record for a student
// @route   POST /api/marks
// @access  Private (Admin, Staff)
exports.saveMarks = async (req, res) => {
  try {
    const { id, studentId, semester, subject, internalMarks, semesterMarks, credits } = req.body;

    const semNum = parseInt(semester, 10);
    const internalVal = parseFloat(internalMarks);
    const semVal = parseFloat(semesterMarks);
    const credVal = parseInt(credits || 3, 10);

    const totalMarks = internalVal + semVal;
    const { grade, gradePoints } = calculateGradeDetails(totalMarks);

    let marksRecord;
    let isNew = true;

    if (id) {
      isNew = false;
      // Edit mode: Update by specific database object ID
      marksRecord = await Marks.findByIdAndUpdate(
        id,
        {
          student: studentId,
          semester: semNum,
          subject: subject.trim(),
          internalMarks: internalVal,
          semesterMarks: semVal,
          totalMarks,
          grade,
          gradePoints,
          credits: credVal,
          recordedBy: req.user._id
        },
        { new: true, runValidators: true }
      );

      if (!marksRecord) {
        return res.status(404).json({
          success: false,
          error: 'Marks record not found'
        });
      }
    } else {
      // Check if a record already exists to determine action type
      const existing = await Marks.findOne({ student: studentId, semester: semNum, subject: subject.trim() });
      if (existing) {
        isNew = false;
      }

      // Add mode: Use findOneAndUpdate with unique index query to prevent duplicate records
      // of same student/sem/subject
      marksRecord = await Marks.findOneAndUpdate(
        { student: studentId, semester: semNum, subject: subject.trim() },
        {
          student: studentId,
          semester: semNum,
          subject: subject.trim(),
          internalMarks: internalVal,
          semesterMarks: semVal,
          totalMarks,
          grade,
          gradePoints,
          credits: credVal,
          recordedBy: req.user._id
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    // Retrieve student name for logging
    const student = await Student.findById(studentId);
    const studentName = student ? student.name : 'Unknown';

    // Record Audit Log entry
    await recordLog({
      action: isNew ? 'CREATE' : 'UPDATE',
      targetModel: 'Marks',
      targetId: marksRecord._id,
      details: `${isNew ? 'Added' : 'Updated'} subject marks for student ${studentName} in ${subject.trim()} (Semester ${semNum}): Total ${totalMarks}% (Grade ${grade})`,
      performedBy: req.user?._id
    });

    res.status(200).json({
      success: true,
      message: 'Marks recorded successfully!',
      data: marksRecord
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A marks record already exists for this subject in the selected semester.'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while saving marks: ' + error.message
    });
  }
};

// @desc    Get marks sheets and Dynamic GPA for a target student
// @route   GET /api/marks/student/:studentId
// @access  Private (Admin, Staff, Student)
exports.getStudentMarks = async (req, res) => {
  try {
    let targetStudentId = req.params.studentId;
    const { semester } = req.query;

    // Security Gate: If student, force query to target only their own profile
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ email: req.user.email.toLowerCase() });
      if (!studentProfile) {
        return res.status(404).json({
          success: false,
          error: 'Student profile associated with this account was not found.'
        });
      }
      targetStudentId = studentProfile._id.toString();
    }

    const query = { student: targetStudentId };
    if (semester) {
      query.semester = parseInt(semester, 10);
    }

    const marksRecords = await Marks.find(query)
      .populate('student', 'name email course')
      .sort({ createdAt: 1 });

    // Dynamic Weighted GPA Calculation:
    // GPA = Sum(Grade Points * Credits) / Sum(Credits)
    let totalCredits = 0;
    let totalWeightedPoints = 0;

    marksRecords.forEach((rec) => {
      totalCredits += rec.credits;
      totalWeightedPoints += rec.gradePoints * rec.credits;
    });

    const calculatedGPA = totalCredits > 0 ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: marksRecords,
      gpa: calculatedGPA,
      totalCredits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while fetching student marks sheets: ' + error.message
    });
  }
};

// @desc    Delete a marks record
// @route   DELETE /api/marks/:id
// @access  Private (Admin, Staff)
exports.deleteMarks = async (req, res) => {
  try {
    const marksRecord = await Marks.findById(req.params.id);

    if (!marksRecord) {
      return res.status(404).json({
        success: false,
        error: 'Marks record not found'
      });
    }

    const targetId = marksRecord._id;
    const subject = marksRecord.subject;
    const semNum = marksRecord.semester;
    
    // Retrieve student name for logging
    const student = await Student.findById(marksRecord.student);
    const studentName = student ? student.name : 'Unknown';

    await marksRecord.deleteOne();

    // Record Audit Log entry
    await recordLog({
      action: 'DELETE',
      targetModel: 'Marks',
      targetId: targetId,
      details: `Deleted subject marks for student ${studentName} in ${subject} (Semester ${semNum})`,
      performedBy: req.user?._id
    });

    res.status(200).json({
      success: true,
      message: 'Marks record deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while deleting marks: ' + error.message
    });
  }
};
