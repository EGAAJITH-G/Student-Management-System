const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject name'],
    trim: true
  },
  internalMarks: {
    type: Number,
    required: [true, 'Please provide internal marks'],
    min: [0, 'Internal marks cannot be less than 0'],
    max: [40, 'Internal marks cannot exceed 40']
  },
  semesterMarks: {
    type: Number,
    required: [true, 'Please provide semester marks'],
    min: [0, 'Semester marks cannot be less than 0'],
    max: [60, 'Semester marks cannot exceed 60']
  },
  totalMarks: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F']
  },
  gradePoints: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    required: true,
    default: 3,
    min: [1, 'Credits must be at least 1'],
    max: [5, 'Credits cannot exceed 5']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce unique composite index so a student cannot have duplicate marks for the same subject in the same semester
MarksSchema.index({ student: 1, semester: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Marks', MarksSchema);
