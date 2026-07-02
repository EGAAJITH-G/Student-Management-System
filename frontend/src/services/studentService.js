import axios from 'axios';

// The baseUrl is mapped through our Vite proxy configuration to target http://localhost:5000/api/students
const API_URL = '/api/students';

const studentService = {
  /**
   * Fetch all students (with optional search filter query)
   * @param {string} search 
   * @returns {Promise<Array>}
   */
  getStudents: async (search = '', course = 'All', sortBy = 'createdAt:desc', page = null, limit = null) => {
    const response = await axios.get(API_URL, {
      params: {
        search: search || undefined,
        course: course !== 'All' ? course : undefined,
        sortBy: sortBy || undefined,
        page: page || undefined,
        limit: limit || undefined
      }
    });
    return response.data;
  },

  /**
   * Add a new student record
   * @param {object} studentData 
   * @returns {Promise<object>}
   */
  createStudent: async (studentData) => {
    const response = await axios.post(API_URL, studentData);
    return response.data;
  },

  /**
   * Update student details by ID
   * @param {string} id 
   * @param {object} studentData 
   * @returns {Promise<object>}
   */
  updateStudent: async (id, studentData) => {
    const response = await axios.put(`${API_URL}/${id}`, studentData);
    return response.data;
  },

  /**
   * Remove a student record by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  deleteStudent: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default studentService;
