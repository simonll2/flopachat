<template>
  <div v-if="productDetails" class="product-detail container my-5">
    <div class="row g-5">
      <div class="col-lg-6">
        <div class="card shadow-sm">
          <img
            :src="'' + productDetails.imagePath"
            alt="Product Image"
            class="card-img-top img-fluid"
          />
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card-body">
          <h1 class="card-title display-4">{{ productDetails.name }}</h1>
          <p class="card-text text-muted">{{ productDetails.description }}</p>
          <hr />
          <h3 class="text-primary">{{ formatCurrency(productDetails.price) }} €</h3>
          <p><strong>Stock:</strong> {{ productDetails.stock }}</p>
          <button class="btn btn-primary btn-lg w-100 mt-3" @click="addToCartHandler">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-5">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-3">Loading...</p>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";

export default {
  name: "ProductDetail",
  computed: {
    ...mapState("product", {
      productDetails: (state) => state.product,
    }),
    ...mapGetters("auth", ["isAuthenticated"]),
  },
  watch: {
    "$route.params.id": {
      handler() {
        this.fetchProductDetails();
      },
      immediate: true,
    },
  },
  created() {
    this.fetchProductDetails();
  },
  methods: {
    ...mapActions("product", ["fetchProductById"]),
    ...mapActions("cart", ["addToCart"]),
    async fetchProductDetails() {
      const productId = this.$route.params.id;
      try {
        await this.fetchProductById(productId);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    },
    addToCartHandler() {
      if (!this.isAuthenticated) {
        this.$router.push({ name: "Login" });
      } else {
        console.log("Adding to cart: ", this.productDetails._id);
        this.addToCart({ productId: this.productDetails._id, quantity: 1 });
      }
    },
    formatCurrency(price) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(price);
    },
  },
};
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
}
.card img {
  border: none;
  width: 565px !important;
  height: 370px !important;
  object-fit: cover;
}
.card-body {
  padding: 2rem;
}
.card-title {
  font-size: 2.5rem;
  font-weight: bold;
}
.card-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
