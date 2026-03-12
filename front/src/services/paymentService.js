// src/services/paymentService.js
import axios from "axios";
import { getToken } from "../utils/auth";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.VUE_APP_STRIPE_PUBLIC_KEY || "pk_test_51PK9Z7FuOuEKM0JlpqImNwZDlSEVLgPIKmu4ug9iEBhmFlYy6daHz0seLnLX0GSvTjRjR35YOLu5ReEZLHpQGU9Y00YITkJNm9"
);

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

  async redirectToCheckout(sessionId) {
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });
  }
}

export default new PaymentService();
