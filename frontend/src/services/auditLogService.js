import axios from 'axios';

const API_URL = '/api/audit-logs';

const auditLogService = {
  /**
   * Fetch system audit trail logs (Admin only)
   * @returns {Promise<object>}
   */
  getLogs: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
};

export default auditLogService;
