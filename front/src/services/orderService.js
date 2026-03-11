// src/services/orderService.js
import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "/api";

class OrderService {
  async getAllOrders() {
    const token = getToken();
    return axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getAllOrdersForAdmin() {
    const token = getToken();
    return axios.get(`${API_URL}/admin/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getOrderById(orderId) {
    const token = getToken();
    return axios.get(`${API_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async confirmOrder(sessionId) {
    const token = getToken();
    return axios.post(
      `${API_URL}/orders/confirm`,
      { sessionId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}

export default new OrderService();
