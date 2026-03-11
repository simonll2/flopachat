<!-- src/views/PaymentPage.vue -->
<template>
  <div>
    <h1>Payment Page</h1>
    <Payment />
  </div>
</template>

<script>
import Payment from "../../components/Payment/Payment.vue";

export default {
  components: {
    Payment,
  },
};
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}
</style>
