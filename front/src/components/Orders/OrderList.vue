<template>
  <div class="order container my-5">
    <h1 class="text-center mb-4">Vos Commandes</h1>
    <div v-if="orders && orders.length > 0">
      <Order v-for="order in orders" :key="order._id" :order="order" />
    </div>
    <div v-else class="no-orders">
      <i class="bi bi-cart-x display-1 text-muted"></i>
      <p class="text-center mt-3">Aucune commande trouvée.</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Order from "./Order.vue";

export default {
  name: "OrderList",
  components: { Order },
  computed: {
    ...mapState("order", ["orders"]),
  },
  created() {
    this.fetchOrders();
  },
  methods: {
    ...mapActions("order", ["fetchOrders"]),
  },
};
</script>

<style scoped>
.order {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.no-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>
