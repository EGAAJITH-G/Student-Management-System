import axios from 'axios';

const API_URL = '/api/marks';

const marksService = {
  /**
   * Save or update subject marks record for a student
   * @param {object} data - { id?, studentId, semester, subject, internalMarks, semesterMarks, credits }
   * @returns {Promise<object>}
   */
  saveMarks: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  /**
   * Fetch marks and GPA sheets for a specific student, optionally filtered by semester
   * @param {string} studentId
   * @param {number|string} [semester] - 1-indexed (1-8)
   * @returns {Promise<object>}
   */
  getStudentMarks: async (studentId, semester) => {
    const params = {};
    if (semester) {
      params.semester = semester;
    }
    const response = await axios.get(`${API_URL}/student/${studentId}`, { params });
    return response.data;
  },

  /**
   * Delete a marks record by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  deleteMarks: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default marksService;
