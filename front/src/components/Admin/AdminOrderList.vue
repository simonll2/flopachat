<template>
  <div class="order-list row">
    <AdminOrder
      v-for="order in sortedOrders"
      :key="order._id"
      :order="order"
      class="col-md-4 mb-4 px-2"
      @order-updated="fetchOrders"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AdminOrder from "./AdminOrder.vue";

export default {
  name: "OrderList",
  components: {
    AdminOrder,
  },
  computed: {
    ...mapGetters("order", ["allOrders"]),
    sortedOrders() {
      return [...this.allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  },
  async created() {
    try {
      await this.fetchOrders();
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  },
  methods: {
    ...mapActions("order", ["fetchAllOrdersForAdmin"]),
    fetchOrders() {
      this.fetchAllOrdersForAdmin();
    },
  },
};
</script>

<style scoped>
.order-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
</style>
