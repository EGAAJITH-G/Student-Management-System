const { body, validationResult } = require('express-validator');

// Common validation results check middleware
const checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg, // Return the first validation error message
      errors: errors.array()
    });
  }
  next();
};

// User Registration Validation rules
const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('User role selection is required')
    .isIn(['admin', 'staff', 'student'])
    .withMessage('Invalid role selection. Must be Admin, Staff, or Student'),
  checkValidationResults
];

// User Login Validation rules
const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  checkValidationResults
];

// Student Profile Validation rules
const validateStudent = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student full name is required')
    .isLength({ min: 2 })
    .withMessage('Student name must be at least 2 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Student email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Major / Course allocation is required'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((val) => {
      // Must be a 10-digit number
      const numStr = String(val);
      if (!/^[0-9]{10}$/.test(numStr)) {
        throw new Error('Phone number must be exactly 10 numeric digits');
      }
      return true;
    }),
  checkValidationResults
];

// Subject Marks Validation rules
const validateMarks = [
  body('studentId')
    .notEmpty()
    .withMessage('Student identifier reference is required')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  body('semester')
    .notEmpty()
    .withMessage('Semester is required')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be an integer between 1 and 8'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),
  body('internalMarks')
    .notEmpty()
    .withMessage('Internal marks are required')
    .isFloat({ min: 0, max: 40 })
    .withMessage('Internal marks must be a number between 0 and 40'),
  body('semesterMarks')
    .notEmpty()
    .withMessage('Semester marks are required')
    .isFloat({ min: 0, max: 60 })
    .withMessage('Semester marks must be a number between 0 and 60'),
  body('credits')
    .notEmpty()
    .withMessage('Subject credits are required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Credits must be an integer between 1 and 5'),
  checkValidationResults
];

module.exports = {
  validateRegister,
  validateLogin,
  validateStudent,
  validateMarks
};
