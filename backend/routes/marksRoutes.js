const express = require('express');
const router = express.Router();
const {
  saveMarks,
  getStudentMarks,
  deleteMarks
} = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateMarks } = require('../middleware/validationMiddleware');

// Admin and Staff can save or delete marks
router.post('/', protect, authorize('admin', 'staff'), validateMarks, saveMarks);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteMarks);

// All roles (Admin, Staff, Student) can view marks, but Student role is filtered internally
router.get('/student/:studentId', protect, getStudentMarks);

module.exports = router;
