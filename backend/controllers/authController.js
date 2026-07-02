const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { recordLog } = require('./auditLogController');
const nodemailer = require('nodemailer');

/**
 * Generate a JSON Web Token
 * @param {string} id - User ID 
 * @returns {string} Signed JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token remains valid for 30 days
  });
};

// @desc    Register a new administrator or staff or student
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, role, secretKey } = req.body;

    // Validate registration secret key for administrative roles
    if (role === 'admin') {
      const requiredKey = process.env.ADMIN_REGISTRATION_KEY || 'admin2026';
      if (secretKey !== requiredKey) {
        return res.status(403).json({
          success: false,
          error: 'Invalid Admin Registration Security Code. Unauthorized role creation.'
        });
      }
    } else if (role === 'staff') {
      const requiredKey = process.env.STAFF_REGISTRATION_KEY || 'staff2026';
      if (secretKey !== requiredKey) {
        return res.status(403).json({
          success: false,
          error: 'Invalid Staff Registration Security Code. Unauthorized role creation.'
        });
      }
    }

    // Check if email or username is already taken
    const userEmailExists = await User.findOne({ email: email.toLowerCase() });
    if (userEmailExists) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists'
      });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        error: 'Username is already taken'
      });
    }

    // Register user (password hashing triggers automatically in model pre-save hook)
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'student'
    });

    // Record Audit Log entry
    await recordLog({
      action: 'CREATE',
      targetModel: 'User',
      targetId: user._id,
      details: `New account registered: ${username} with role ${user.role}`,
      performedBy: user._id
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred during account registration: ' + error.message
    });
  }
};

// @desc    Authenticate administrator & login
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user and include password hash
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.'
      });
    }

    // Match password using User instance method
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Password incorrect.'
      });
    }

    // Record Audit Log entry
    await recordLog({
      action: 'LOGIN',
      targetModel: 'User',
      targetId: user._id,
      details: `User session logged in: ${user.username}`,
      performedBy: user._id
    });

    res.status(200).json({
      success: true,
      token: generateToken(user._id, user.role),
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred during login authentication: ' + error.message
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Protected)
exports.getMe = async (req, res) => {
  try {
    // req.user is already populated by protect middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while fetching user profile'
    });
  }
};

// @desc    Forgot Password OTP request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with this email' });
    }

    // Generate 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiration (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Mail Options configuration
    const mailOptions = {
      from: `"EduPortal Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset OTP - EduPortal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 16px; color: #334155;">You requested a password reset for your account. Please use the verification OTP code below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">This OTP code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    // Send real email via SMTP
    await transporter.sendMail(mailOptions);

    await recordLog({
      action: 'PASSWORD_RESET_REQUEST',
      targetModel: 'User',
      targetId: user._id,
      details: `Password recovery OTP generated and emailed to: ${user.email}`,
      performedBy: user._id
    });

    res.status(200).json({
      success: true,
      message: 'OTP has been successfully sent to your registered email address!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while generating password OTP: ' + error.message
    });
  }
};

// @desc    Reset password using OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email, otp, and new password' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOtp: otp,
      resetPasswordOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code code.' });
    }

    // Update password (triggers hashing in model pre-save hook)
    user.password = password;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpire = null;
    await user.save();

    await recordLog({
      action: 'PASSWORD_RESET_SUCCESS',
      targetModel: 'User',
      targetId: user._id,
      details: `Password reset successfully via OTP verification: ${user.email}`,
      performedBy: user._id
    });

    res.status(200).json({
      success: true,
      message: 'Password has been updated successfully! You can login now.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while resetting password: ' + error.message
    });
  }
};
