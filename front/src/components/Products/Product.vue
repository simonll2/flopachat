<template>
  <div class="card product-card">
    <div class="image-container">
      <img :src="getImageSrc(productLocal.imagePath)" class="card-img-top" alt="Product Image" />
      <div class="overlay">
        <p class="description">{{ updatedDescription }}</p>
        <button
          @click="addToCartHandler"
          class="btn btn-warning add-to-cart-btn"
          :disabled="productLocal.stock === 0"
          :class="{ 'btn-success': addedToCart }"
        >
          Ajouter au panier
        </button>
      </div>
      <span v-if="productLocal.stock === 0" class="badge bg-danger out-of-stock-badge">Rupture de stock</span>
      <span v-else class="badge bg-success in-stock-badge">En stock</span>
    </div>
    <div class="card-body d-flex flex-column">
      <div class="product-info">
        <h5 class="card-title">{{ updatedName }}</h5>
        <p class="card-text"><strong>Prix:</strong> {{ productLocal.price }} €</p>
        <div class="thumbs-container">
          <div class="thumbs-up" @click="updateThumbs('thumbsUp')">
            <i class="bi bi-hand-thumbs-up-fill text-success"></i>
            <span>{{ productLocal.thumbsUp }}</span>
          </div>
          <div class="thumbs-down" @click="updateThumbs('thumbsDown')">
            <i class="bi bi-hand-thumbs-down-fill text-danger"></i>
            <span>{{ productLocal.thumbsDown }}</span>
          </div>
          <span v-if="alreadyVoted" class="badge bg-warning text-dark voted-badge">Déjà voté</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Product",
  props: {
    product: {
      type: Object,
      required: true,
    },
    votedProducts: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      productLocal: { ...this.product },
      alreadyVoted: false,
      addedToCart: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    products() {
      return this.$store.getters["product/allProducts"];
    },
    updatedName() {
      if (this.productLocal.name.includes("nombre")) {
        return this.productLocal.name.replace("nombre", this.productLocal.thumbsUp);
      }
      return this.productLocal.name;
    },
    updatedDescription() {
      if (this.productLocal.description.includes("nombre")) {
        return this.productLocal.description.replace("nombre", this.productLocal.thumbsUp);
      }
      return this.productLocal.description;
    },
  },
  watch: {
    products: {
      handler(newProducts) {
        const updatedProduct = newProducts.find((p) => p._id === this.product._id);
        if (updatedProduct) {
          this.productLocal = { ...updatedProduct }; // Update the local product data
        }
      },
      immediate: true,
      deep: true,
    },
    votedProducts: {
      handler() {
        this.checkIfAlreadyVoted();
      },
      immediate: true,
    },
  },
  mounted() {
    this.checkIfAlreadyVoted();
  },
  methods: {
    ...mapActions("cart", ["addToCart"]),
    ...mapActions("product", ["updateProductThumbs", "fetchProducts"]),
    async addToCartHandler() {
      if (!this.isAuthenticated) {
        this.$router.push({ name: "Login" });
      } else {
        await this.addToCart({ productId: this.product._id, quantity: 1 });
        this.addedToCart = true;
        setTimeout(() => {
          this.addedToCart = false;
        }, 1000);
        await this.fetchProducts(); // Refresh the products to get the updated stock
      }
    },
    getImageSrc(imagePath) {
      return imagePath
        ? `${imagePath}`
        : `/static/products/default-product.jpg`;
    },
    async updateThumbs(type) {
      if (!this.isAuthenticated) {
        this.$router.push({ name: "Login" });
        return;
      }
      try {
        await this.updateProductThumbs({ productId: this.product._id, type });
        this.alreadyVoted = true; // Indiquer que l'utilisateur a voté après la mise à jour
        await this.fetchProducts(); // Rafraîchir les produits pour obtenir les nouveaux nombres de votes
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.error("User has already voted for this product");
          this.alreadyVoted = true; // Indiquer que l'utilisateur a déjà voté
        } else {
          console.error("Error updating thumbs:", error);
        }
      }
    },
    checkIfAlreadyVoted() {
      if (this.votedProducts && this.votedProducts.some((product) => product._id === this.product._id)) {
        this.alreadyVoted = true;
      }
    },
  },
};
</script>

<style scoped>
.product-card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  width: 250px;
  margin: 0 10px; /* Ajouter un espace entre les produits */
  position: relative;
}

.product-card:hover {
  transform: scale(1.05);
}

.image-container {
  position: relative;
  overflow: hidden;
  padding-top: 8px; /* Ajoute du padding en haut */
}

.card-img-top {
  height: 200px; /* Height of the image */
  width: 100%; /* Ensure the image takes full width of the container */
  object-fit: cover; /* Ensures the image covers the container while maintaining its aspect ratio */
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9); /* Increased opacity for a stronger blur effect */
  opacity: 0;
  display: flex;
  flex-direction: column; /* Stack description and button vertically */
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  transition: opacity 0.3s ease-in-out;
}

.image-container:hover .overlay {
  opacity: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
  height: 2.4em; /* Fixed height to avoid shifting */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-text {
  margin-bottom: 15px;
  height: 1.2em; /* Fixed height to avoid shifting */
}

.description {
  font-size: 1rem;
  color: #333;
  font-weight: bold; /* Make the text bold for better readability */
}

.btn-warning {
  margin-top: 10px; /* Add some space between the description and the button */
}

.btn-warning:disabled {
  cursor: not-allowed;
  pointer-events: all !important;
}

.add-to-cart-btn {
  transition: background-color 0.5s ease;
}

.add-to-cart-btn.btn-success {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
}

.thumbs-container {
  display: flex;
  justify-content: space-around; /* Ensure thumbs stay in place */
  width: 100%;
  margin-top: 10px;
  position: relative; /* Add relative positioning to contain the badge */
}

.thumbs-down {
  margin-left: 10px; /* Add space between the thumbs */
}

.thumbs-up {
  margin-right: 10px; /* Add space between the thumbs */
}

.thumbs-up,
.thumbs-down {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease-in-out;
}

.thumbs-up:hover,
.thumbs-down:hover {
  transform: scale(1.2);
}

.thumbs-up:active,
.thumbs-down:active {
  transform: scale(0.9);
}

.text-success {
  color: green;
}

.text-danger {
  color: red;
}

.voted-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  padding: 5px;
}

.in-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 5px;
}

.out-of-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 5px;
}
</style>
