import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://server-service.info/api";

class AuthService {
  async register(user) {
    return axios.post(`${API_URL}/register`, user, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async login(user) {
    const response = await axios.post(`${API_URL}/login`, user);
    return response;
  }

  async getUserProfile(userId) {
    const token = getToken();
    return axios.get(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUser(userId, formData) {
    const token = getToken();
    return axios.put(`${API_URL}/users/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deleteUser(userId) {
    const token = getToken();
    return axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async validateToken(token) {
    const response = await axios.post(`${API_URL}/validate-token`, { token });
    return response;
  }

  async getAllUsers() {
    const token = getToken();
    return axios.get(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default new AuthService();
