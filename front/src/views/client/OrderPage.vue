<template>
  <div class="order-page">
    <OrderList />
  </div>
</template>

<script>
import OrderList from "../../components/Orders/OrderList.vue";

export default {
  name: "OrderPage",
  components: {
    OrderList,
  },
};
</script>

<style scoped>
.order-page {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
</style>
