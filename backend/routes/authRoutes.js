const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// Public registration and login routes (validated)
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Password recovery routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected user profile query route
router.get('/me', protect, getMe);

module.exports = router;
