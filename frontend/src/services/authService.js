import axios from 'axios';

const API_URL = '/api/auth';

const authService = {
  /**
   * Register a new admin account
   * @param {object} userData - { username, email, password }
   * @returns {Promise<object>} Response containing token and user details
   */
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  /**
   * Authenticate admin & login
   * @param {object} credentials - { email, password }
   * @returns {Promise<object>} Response containing token and user details
   */
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },

  /**
   * Fetch details of currently logged-in administrator
   * @returns {Promise<object>} User profile details
   */
  getMe: async () => {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  },

  /**
   * Request OTP code for password recovery
   * @param {string} email
   * @returns {Promise<object>}
   */
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  /**
   * Reset user password using OTP
   * @param {string} email
   * @param {string} otp
   * @param {string} password
   * @returns {Promise<object>}
   */
  resetPassword: async (email, otp, password) => {
    const response = await axios.post(`${API_URL}/reset-password`, { email, otp, password });
    return response.data;
  }
};


export default authService;
