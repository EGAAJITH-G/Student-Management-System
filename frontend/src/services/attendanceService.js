import axios from 'axios';

const API_URL = '/api/attendance';

const attendanceService = {
  /**
   * Save daily attendance records
   * @param {string} date - ISO Date string YYYY-MM-DD
   * @param {Array} records - [{ studentId, status }]
   * @returns {Promise<object>}
   */
  saveAttendance: async (date, records) => {
    const response = await axios.post(API_URL, { date, records });
    return response.data;
  },

  /**
   * Get daily attendance records for a target date
   * @param {string} date - ISO Date string YYYY-MM-DD
   * @returns {Promise<object>}
   */
  getDailyAttendance: async (date) => {
    const response = await axios.get(`${API_URL}/daily`, {
      params: { date }
    });
    return response.data;
  },

  /**
   * Fetch aggregated monthly report
   * @param {number|string} month - 1-indexed (1-12)
   * @param {number|string} year - 4 digits (e.g. 2026)
   * @returns {Promise<object>}
   */
  getMonthlyReport: async (month, year) => {
    const response = await axios.get(`${API_URL}/monthly`, {
      params: { month, year }
    });
    return response.data;
  }
};

export default attendanceService;
