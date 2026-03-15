// src/services/paymentService.js
import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "/api";

class PaymentService {
  async createCheckoutSession(items) {
    const token = getToken();
    const response = await axios.post(
      `${API_URL}/create-checkout-session`,
      { items },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  redirectToCheckout(sessionUrl) {
    window.location.href = sessionUrl;
  }
}

export default new PaymentService();
