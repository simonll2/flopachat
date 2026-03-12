<!-- src/components/Payment.vue -->
<template>
  <div class="text-center p-4">
    <p>Le paiement s'effectue depuis votre panier.</p>
    <router-link to="/cart" class="btn btn-primary">Aller au panier</router-link>
  </div>
</template>

<script>
export default {
  name: "Payment",
};
</script>
