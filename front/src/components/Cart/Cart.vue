<template>
  <div class="cart container my-5">
    <h1 class="text-center mb-4">Votre Panier</h1>
    <div v-if="cart && cart.products.length > 0">
      <div class="cart-items">
        <CartItem
          v-for="item in cart.products"
          :key="item.product._id"
          :item="item"
          @updateQuantity="updateCartItem"
          @removeItem="deleteCartItem"
        />
      </div>
      <div class="total text-end my-3">
        <h4>Total: {{ cart.total }} €</h4>
      </div>
      <div class="text-end">
        <button class="btn btn-primary" @click="processCheckout">Passer à la caisse</button>
      </div>
    </div>
    <div v-else class="text-center empty-cart">
      <i class="bi bi-cart-x display-1 text-muted"></i>
      <p class="mt-3">Votre panier est vide.</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import CartItem from "./CartItem.vue";

export default {
  components: { CartItem },
  computed: {
    ...mapState("cart", ["cart"]),
  },
  methods: {
    ...mapActions("cart", ["fetchCart", "updateCart", "deleteFromCart", "checkout"]),
    updateCartItem(productId, quantity) {
      this.updateCart({ productId, quantity });
    },
    deleteCartItem(productId) {
      this.deleteFromCart(productId);
    },
    async processCheckout() {
      try {
        await this.checkout();
        alert("Redirection vers le paiement...");
      } catch (error) {
        console.error("Échec de la validation du panier:", error);
      }
    },
  },
  created() {
    this.fetchCart();
  },
};
</script>

<style scoped>
.cart {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.cart-items {
  border-bottom: 1px solid #ddd;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.total {
  font-weight: bold;
}
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>
