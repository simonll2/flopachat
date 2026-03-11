<template>
  <div class="cart-item d-flex justify-content-between align-items-center border-bottom py-2">
    <div class="cart-item-info d-flex align-items-center">
      <img :src="getImageSrc(item.product.imagePath)" alt="Product Image" class="product-image me-3" />
      <div>
        <h5>{{ item.product.name }}</h5>
        <p>{{ item.product.price }} € x {{ item.quantity }}</p>
      </div>
    </div>
    <div class="cart-item-actions d-flex align-items-center">
      <button class="btn btn-outline-secondary btn-sm me-2" @click="decreaseQuantity">-</button>
      <button class="btn btn-outline-secondary btn-sm me-2" @click="increaseQuantity">+</button>
      <button class="btn btn-outline-danger btn-sm" @click="removeItem">Supprimer</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    decreaseQuantity() {
      if (this.item.quantity > 1) {
        this.$emit("updateQuantity", this.item.product._id, this.item.quantity - 1);
      } else {
        this.$emit("removeItem", this.item.product._id);
      }
    },
    increaseQuantity() {
      this.$emit("updateQuantity", this.item.product._id, this.item.quantity + 1);
    },
    removeItem() {
      this.$emit("removeItem", this.item.product._id);
    },
    getImageSrc(imagePath) {
      return imagePath
        ? `${imagePath}`
        : `/static/products/default-product.jpg`;
    },
  },
};
</script>

<style scoped>
.cart-item {
  padding: 10px 0;
}
.cart-item-info {
  flex: 1;
}
.cart-item-actions {
  display: flex;
}
.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
