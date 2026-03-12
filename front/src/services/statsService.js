import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "/api/stats";

class StatsService {
  getHeaders() {
    return { Authorization: `Bearer ${getToken()}` };
  }

  async getStatistics() {
    return axios.get(API_URL, { headers: this.getHeaders() });
  }

  async getSummary() {
    return axios.get(`${API_URL}/summary`, { headers: this.getHeaders() });
  }

  async getMonthlyStats() {
    return axios.get(`${API_URL}/monthly`, { headers: this.getHeaders() });
  }

  async getTopProducts() {
    return axios.get(`${API_URL}/top-products`, { headers: this.getHeaders() });
  }
}

export default new StatsService();
