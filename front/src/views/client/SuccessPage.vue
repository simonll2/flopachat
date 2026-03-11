<template>
  <div class="success-page">
    <div v-if="!errorMessage">
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your order has been placed successfully.</p>
    </div>
    <div v-else>
      <h1>Link Expired</h1>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "SuccessPage",
  data() {
    return {
      errorMessage: null,
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    if (sessionId) {
      try {
        await this.confirmOrder(sessionId);
        await this.$store.dispatch("cart/clearCart"); // Clear the cart after order confirmation
      } catch (error) {
        this.errorMessage = error.message || "Failed to confirm order.";
      }
    }
  },
  methods: {
    async confirmOrder(sessionId) {
      try {
        await this.$store.dispatch("order/confirmOrder", sessionId);
      } catch (error) {
        throw new Error("The link has expired or the order has already been placed.");
      }
    },
  },
};
</script>

<style scoped>
.success-page {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  text-align: center;
}
</style>
