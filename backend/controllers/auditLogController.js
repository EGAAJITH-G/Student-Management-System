const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs (Admin only)
// @route   GET /api/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'username email role')
      .sort({ timestamp: -1 })
      .limit(100); // Retrieve the last 100 entries

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error occurred while fetching audit logs: ' + error.message
    });
  }
};

// Helper utility to record log entries seamlessly inside other controllers
exports.recordLog = async ({ action, targetModel, targetId, details, performedBy }) => {
  try {
    await AuditLog.create({
      action,
      targetModel,
      targetId,
      details,
      performedBy
    });
  } catch (error) {
    console.error('Failed to save audit log record:', error.message);
  }
};
