<!-- src/components/Payment.vue -->
<template>
  <div>
    <button @click="handleCheckout">Checkout</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      items: [{ name: "Product 1", description: "Description of product 1", price: 1000, quantity: 1 }],
    };
  },
  methods: {
    ...mapActions("payment", ["createCheckoutSession", "redirectToCheckout"]),
    async handleCheckout() {
      try {
        await this.createCheckoutSession(this.items);
        await this.redirectToCheckout();
      } catch (error) {
        console.error("Error during checkout:", error);
      }
    },
  },
};
</script>
