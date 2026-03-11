<template>
  <div class="order-card card mb-3" v-if="order && order._id">
    <div class="card-header">
      <h2 class="card-title">Commande N°{{ order._id }}</h2>
      <p class="card-subtitle text-muted"><strong>Date :</strong> {{ formatDate(order.createdAt) }}</p>
      <p class="card-subtitle text-muted"><strong>Total :</strong> {{ formatCurrency(order.total) }}</p>
      <p class="card-subtitle text-muted"><strong>État :</strong> {{ translateStatus(order.status) }}</p>
    </div>
    <div class="card-body">
      <div class="product-list d-flex flex-wrap">
        <div
          class="product-item card p-1 m-1"
          v-for="item in order.products"
          :key="item.product ? item.product._id : item._id"
        >
          <div v-if="item.product">
            <img :src="getImageSrc(item.product.imagePath)" alt="Product Image" class="product-image mb-1" />
            <div class="product-details">
              <h6 class="mb-1">{{ item.product.name }}</h6>
              <p class="mb-1"><strong>Quantité :</strong> {{ item.quantity }}</p>
              <p class="mb-1"><strong>Prix :</strong> {{ formatCurrency(item.product.price) }}</p>
            </div>
          </div>
          <div v-else>
            <h6 class="mb-1 text-danger">Produit supprimé</h6>
            <p class="mb-1"><strong>Quantité :</strong> {{ item.quantity }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Order",
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getImageSrc(imagePath) {
      return imagePath
        ? `http://server-service.info${imagePath}`
        : `http://server-service.info/static/products/default-product.jpg`;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(value);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    translateStatus(status) {
      switch (status) {
        case "completed":
          return "Complété";
        case "pending":
          return "En attente";
        case "cancelled":
          return "Annulé";
        default:
          return status;
      }
    },
  },
};
</script>

<style scoped>
.order-card {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  padding: 10px;
}
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.product-item {
  width: calc(20% - 10px); /* Adjust this width as needed */
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 5px;
  text-align: center;
}
.product-image {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.product-details {
  font-size: 0.8rem;
}
</style>
