const express = require('express');
const router = express.Router();
const {
  recordAttendance,
  getDailyAttendance,
  getMonthlyReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'staff'), recordAttendance);
router.get('/daily', protect, authorize('admin', 'staff'), getDailyAttendance);
router.get('/monthly', protect, authorize('admin', 'staff', 'student'), getMonthlyReport);

module.exports = router;