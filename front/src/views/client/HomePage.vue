<!-- src/views/HomePage.vue -->
<template>
  <div class="home-page">
    <div class="product-container">
      <div id="carouselExampleIndicators" class="carousel slide mb-4" data-bs-ride="carousel" data-bs-interval="2000">
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img src="/static/carousel/1.png" class="d-block w-100" alt="Image 1" />
          </div>
        </div>
      </div>
      <ProductList />
    </div>
  </div>
</template>

<script>
import ProductList from "../../components/Products/ProductList.vue";

export default {
  name: "HomePage",
  components: {
    ProductList,
  },
};
</script>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 20px;
}

.product-container {
  border: 1px solid rgb(211, 211, 211);
  background-color: #ececec; /* Légèrement plus foncé */
  padding: 20px;
  border-radius: 8px;
  width: 90%; /* Plus large */
}

.carousel {
  width: 100%;
}

.carousel-inner {
  height: 340px;
}

.carousel-item img {
  object-fit: cover;
  height: 100%;
}
</style>
