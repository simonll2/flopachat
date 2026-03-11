<template>
  <div class="admin-orders-page">
    <div class="order-container">
      <AdminBanner
        title="Gestion des Commandes"
        description="En tant qu'administrateur, vous pouvez :"
        :actions="orderActions"
        @item-added="fetchOrders"
        page="orders"
      />
      <OrderList @order-updated="fetchOrders" />
    </div>
  </div>
</template>

<script>
import OrderList from "../../components/Admin/AdminOrderList.vue";
import AdminBanner from "../../components/Admin/AdminBanner.vue";
import { mapActions } from "vuex";

export default {
  name: "AdminOrdersPage",
  components: {
    OrderList,
    AdminBanner,
  },
  data() {
    return {
      orderActions: [
        { iconClass: "bi bi-plus-circle-fill text-success me-2", text: "Ajouter de nouvelles commandes" },
        { iconClass: "bi bi-pencil-fill text-warning me-2", text: "Modifier les commandes existantes" },
        { iconClass: "bi bi-trash-fill text-danger me-2", text: "Supprimer les commandes" },
        { iconClass: "bi bi-bar-chart-fill text-info me-2", text: "Voir les statistiques des commandes" },
      ],
    };
  },
  methods: {
    ...mapActions("order", ["fetchAllOrdersForAdmin"]),
    fetchOrders() {
      this.fetchAllOrdersForAdmin();
    },
  },
  created() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.admin-orders-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 20px;
}

.order-container {
  border: 1px solid rgb(211, 211, 211);
  background-color: #ececec;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
}
</style>
