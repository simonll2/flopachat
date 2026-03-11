<template>
  <div class="product-list row">
    <Product
      v-for="product in products"
      :key="product._id"
      :product="product"
      :voted-products="userVotedProducts"
      class="col-md-4 mb-4 px-2"
      @thumbs-updated="handleThumbsUpdated"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Product from "./Product.vue";

export default {
  name: "ProductList",
  components: {
    Product,
  },
  computed: {
    ...mapGetters("product", ["allProducts", "userVotedProducts"]),
    ...mapGetters("auth", ["isAuthenticated"]),
    products() {
      return this.allProducts;
    },
  },
  async created() {
    try {
      await this.fetchProducts();
      if (this.isAuthenticated) {
        await this.fetchUserVotedProducts();
      }
    } catch (error) {
      console.error("Error fetching products or votes:", error);
    }
  },
  methods: {
    ...mapActions("product", ["fetchProducts", "fetchUserVotedProducts", "updateProductThumbs"]),
    handleThumbsUpdated(updatedProduct) {
      this.$store.commit("product/UPDATE_PRODUCT", updatedProduct);
    },
  },
};
</script>

<style scoped>
.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Align left with space between items */
}
</style>
