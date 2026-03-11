<template>
  <div class="cart-page">
    <Cart />
  </div>
</template>

<script>
import Cart from "../../components/Cart/Cart.vue";

export default {
  name: "CartPage",
  components: {
    Cart,
  },
};
</script>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
</style>
