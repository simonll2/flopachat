<template>
  <div class="card order-card">
    <div class="card-body">
      <div class="order-info">
        <h5 class="card-title">Commande #{{ order._id }}</h5>
        <p class="card-text"><strong>Date:</strong> {{ formattedDate }}</p>
        <p class="card-text"><strong>Total:</strong> {{ order.total }} €</p>
        <p class="card-text"><strong>État:</strong> {{ order.status }}</p>
        <div v-if="order.user">
          <p class="card-text"><strong>Utilisateur:</strong> {{ order.user.firstName }} {{ order.user.lastName }}</p>
        </div>
        <div v-else>
          <p class="card-text text-danger"><strong>Utilisateur:</strong> Utilisateur supprimé</p>
        </div>
      </div>
      <div class="product-list d-flex flex-wrap">
        <div
          v-for="product in order.products"
          :key="product._id"
          class="product-item d-flex align-items-center me-4 mb-3"
        >
          <div v-if="product.product">
            <img :src="getImageSrc(product.product.imagePath)" alt="Product Image" class="product-image me-2" />
            <div>
              <p class="product-name">{{ product.product.name }}</p>
              <p class="product-quantity">Quantité: {{ product.quantity }}</p>
              <p class="product-price">Prix unitaire: {{ product.product.price }} €</p>
            </div>
          </div>
          <div v-else>
            <p class="text-danger">Produit supprimé</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminOrder",
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedDate() {
      const date = new Date(this.order.createdAt);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  methods: {
    getImageSrc(imagePath) {
      return imagePath
        ? `${imagePath}`
        : `/static/products/default-product.jpg`;
    },
  },
};
</script>

<style scoped>
.order-card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  width: 100%;
  margin: 10px 0;
}

.order-card:hover {
  transform: scale(1.02);
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.order-info {
  margin-bottom: 15px;
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.card-text {
  margin-bottom: 5px;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
}

.product-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 15px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  font-size: 0.9rem;
  margin: 0;
}

.product-quantity,
.product-price {
  font-size: 0.85rem;
  margin: 0;
}

.text-danger {
  color: red;
}
</style>
