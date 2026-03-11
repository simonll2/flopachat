<template>
  <div class="admin-product-page">
    <div class="product-container">
      <AdminBanner :page="'products'" @item-added="fetchProducts" />
      <ProductList @product-updated="fetchProducts" />
    </div>
  </div>
</template>

<script>
import ProductList from "../../components/Admin/AdminProductList.vue";
import AdminBanner from "../../components/Admin/AdminBanner.vue";
import { mapActions } from "vuex";

export default {
  name: "AdminProductsPage",
  components: {
    ProductList,
    AdminBanner,
  },
  methods: {
    ...mapActions("product", ["fetchProducts"]),
  },
};
</script>

<style scoped>
.admin-product-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 20px;
}

.product-container {
  border: 1px solid rgb(211, 211, 211);
  background-color: #ececec;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
}
</style>
