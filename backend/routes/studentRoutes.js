const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUploadStudents
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateStudent } = require('../middleware/validationMiddleware');

// Lock down all student endpoints inside this router
router.use(protect);

router.post('/bulk', authorize('admin', 'staff'), bulkUploadStudents);

router.route('/')
  .get(authorize('admin', 'staff', 'student'), getStudents)
  .post(authorize('admin'), validateStudent, createStudent);

router.route('/:id')
  .put(authorize('admin', 'staff'), validateStudent, updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
