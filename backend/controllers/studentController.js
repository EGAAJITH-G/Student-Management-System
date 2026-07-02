const Student = require('../models/Student');
const { uploadImage } = require('../config/cloudinaryConfig');
const { recordLog } = require('./auditLogController');

// @desc    Get all students (with optional search, course filter, sorting, and pagination)
// @route   GET /api/students
// @access  Public
exports.getStudents = async (req, res) => {
  try {
    const { search, course, sortBy, page, limit } = req.query;
    let query = {};

    // 1. Search by Name or Email (Regex case-insensitive text search)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // 2. Filter by Course (if course is not "All")
    if (course && course !== 'All') {
      query.course = { $regex: `^${course.trim()}$`, $options: 'i' };
    }

    // 3. Sort Students dynamically
    let sortQuery = { createdAt: -1 }; // Default: Newest registered first
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sortQuery = {};
      sortQuery[field] = order === 'desc' ? -1 : 1;
    }

    // 4. Pagination
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    const total = await Student.countDocuments(query);
    let students;

    if (pageInt || limitInt) {
      const activePage = pageInt || 1;
      const activeLimit = limitInt || 10;
      const skip = (activePage - 1) * activeLimit;

      students = await Student.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(activeLimit);

      res.status(200).json({
        success: true,
        page: activePage,
        limit: activeLimit,
        totalPages: Math.ceil(total / activeLimit),
        total: total,
        data: students
      });
    } else {
      students = await Student.find(query).sort(sortQuery);
      res.status(200).json({
        success: true,
        total: total,
        data: students
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while fetching students: ' + error.message
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin, Staff)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, course, phone, profileImage } = req.body;

    // Check if student with email already exists
    const studentExists = await Student.findOne({ email: email.toLowerCase() });
    if (studentExists) {
      return res.status(400).json({
        success: false,
        error: 'A student with this email address already exists'
      });
    }

    // Upload image to Cloudinary if provided (falls back to base64 if not configured)
    let uploadedUrl = '';
    if (profileImage) {
      uploadedUrl = await uploadImage(profileImage);
    }

    const student = await Student.create({
      name,
      email,
      course,
      phone,
      profileImage: uploadedUrl
    });

    // Record Audit Log entry
    await recordLog({
      action: 'CREATE',
      targetModel: 'Student',
      targetId: student._id,
      details: `Registered student profile: ${student.name} (${student.email})`,
      performedBy: req.user?._id
    });

    // Broadcast Socket.IO live notification event if attached
    const io = req.app.get('io');
    if (io) {
      io.emit('student_added', {
        _id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        addedBy: req.user?.username || 'Staff member'
      });
    }

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while creating student: ' + error.message
    });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin, Staff)
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, course, phone, profileImage } = req.body;

    // Find student first
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if updating email to one that is already taken by another student
    if (email && email.toLowerCase() !== student.email.toLowerCase()) {
      const emailTaken = await Student.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'A student with this email address already exists'
        });
      }
    }

    // Upload new image to Cloudinary if provided
    let uploadedUrl = student.profileImage;
    if (profileImage && profileImage !== student.profileImage) {
      uploadedUrl = await uploadImage(profileImage);
    }

    // Update fields
    student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course, phone, profileImage: uploadedUrl },
      { new: true, runValidators: true }
    );

    // Record Audit Log entry
    await recordLog({
      action: 'UPDATE',
      targetModel: 'Student',
      targetId: student._id,
      details: `Modified student profile: ${student.name}`,
      performedBy: req.user?._id
    });

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while updating student: ' + error.message
    });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const studentName = student.name;
    const studentId = student._id;

    await student.deleteOne();

    // Record Audit Log entry
    await recordLog({
      action: 'DELETE',
      targetModel: 'Student',
      targetId: studentId,
      details: `Deleted student record: ${studentName}`,
      performedBy: req.user?._id
    });

    // Broadcast Socket.IO live notification event if attached
    const io = req.app.get('io');
    if (io) {
      io.emit('student_deleted', {
        id: studentId,
        name: studentName,
        deletedBy: req.user?.username || 'Administrator'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while deleting student: ' + error.message
    });
  }
};

// @desc    Bulk upload students
// @route   POST /api/students/bulk
// @access  Private (Admin, Staff)
exports.bulkUploadStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of students to upload.'
      });
    }

    const errors = [];
    const studentsToInsert = [];
    const seenEmails = new Set();

    // Fetch existing emails to prevent duplicates
    const allExistingStudents = await Student.find({}, 'email');
    const existingEmails = new Set(allExistingStudents.map(s => s.email.toLowerCase()));

    for (let i = 0; i < students.length; i++) {
      const { name, email, course, phone } = students[i];
      const rowNum = i + 1;

      // Basic fields presence check
      if (!name || !name.trim()) {
        errors.push(`Row ${rowNum}: Name is required`);
        continue;
      }
      if (!email || !email.trim()) {
        errors.push(`Row ${rowNum}: Email is required`);
        continue;
      }
      if (!course || !course.trim()) {
        errors.push(`Row ${rowNum}: Course is required`);
        continue;
      }
      if (!phone) {
        errors.push(`Row ${rowNum}: Phone number is required`);
        continue;
      }

      // Format validations
      const emailLower = email.trim().toLowerCase();
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(emailLower)) {
        errors.push(`Row ${rowNum}: Invalid email format (${email})`);
        continue;
      }

      const phoneStr = String(phone).trim();
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phoneStr)) {
        errors.push(`Row ${rowNum}: Phone number must be exactly 10 digits (${phone})`);
        continue;
      }

      // Check duplicates in database
      if (existingEmails.has(emailLower)) {
        errors.push(`Row ${rowNum}: A student with email "${email}" is already registered`);
        continue;
      }

      // Check duplicates in the uploaded batch itself
      if (seenEmails.has(emailLower)) {
        errors.push(`Row ${rowNum}: Duplicate email "${email}" found in the uploaded file`);
        continue;
      }

      seenEmails.add(emailLower);
      studentsToInsert.push({
        name: name.trim(),
        email: emailLower,
        course: course.trim(),
        phone: Number(phoneStr),
        profileImage: '' // Bulk upload has no profile images initially
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for some records',
        errors
      });
    }

    // Insert all students in bulk
    const insertedStudents = await Student.insertMany(studentsToInsert);

    // Record Audit Log entry
    await recordLog({
      action: 'CREATE',
      targetModel: 'Student',
      details: `Bulk uploaded ${insertedStudents.length} student profiles`,
      performedBy: req.user?._id
    });

    // Broadcast Socket.IO live notification event
    const io = req.app.get('io');
    if (io) {
      io.emit('student_added', {
        bulk: true,
        count: insertedStudents.length,
        addedBy: req.user?.username || 'Administrator'
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${insertedStudents.length} students.`,
      count: insertedStudents.length,
      data: insertedStudents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred during bulk upload: ' + error.message
    });
  }
};

