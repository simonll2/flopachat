// src/services/productService.js

import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "/api";

class ProductService {
  async getAllProducts() {
    return axios.get(`${API_URL}/products`);
  }

  async getProductById(productId) {
    return axios.get(`${API_URL}/products/${productId}`);
  }

  async createProduct(product) {
    const token = getToken();
    return axios.post(`${API_URL}/products`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProduct(productId, product) {
    const token = getToken();
    return axios.put(`${API_URL}/products/${productId}`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteProduct(productId) {
    const token = getToken();
    return axios.delete(`${API_URL}/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProductThumbs(productId, type, value) {
    const token = getToken();
    return axios.patch(
      `${API_URL}/products/${productId}/thumbs`,
      { [type]: value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async getUserVotedProducts() {
    const token = getToken();
    return axios.get(`${API_URL}/users/voted-products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default new ProductService();
