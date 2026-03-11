// src/services/cartService.js
import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "/api";

class CartService {
  async getCart() {
    const token = getToken();
    return axios.get(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addToCart(productId, quantity) {
    const token = getToken();
    return axios.post(
      `${API_URL}/cart`,
      { productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async updateCart(productId, quantity) {
    const token = getToken();
    return axios.put(
      `${API_URL}/cart`,
      { productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async deleteFromCart(productId) {
    const token = getToken();
    return axios.delete(`${API_URL}/cart/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default new CartService();
