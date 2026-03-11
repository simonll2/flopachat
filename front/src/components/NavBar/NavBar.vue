<template>
  <nav class="navbar fixed-top">
    <div class="navbar-container">
      <div class="brand-container">
        <router-link class="navbar-brand" to="/">FlopAchat</router-link>
        <div class="brand-subtitle">Meilleur que cette fraude de TopAchat</div>
      </div>
      <div class="search-container">
        <input
          type="text"
          class="search-input"
          placeholder="Search for Products, Brands and more"
          v-model="searchQuery"
          @input="onSearchInput"
          @focus="onSearchInput"
        />
        <div class="btn btn-search btn-search-disabled">
          <i class="bi bi-search"></i>
        </div>
        <div v-if="filteredProducts.length" class="dropdown-menu show search-dropdown" ref="searchDropdownRef">
          <div
            class="dropdown-item selected"
            v-for="product in filteredProducts"
            :key="product._id"
            @click="selectProduct(product)"
          >
            <img :src="'http://server-service.info' + product.imagePath" alt="Product Image" class="product-thumbnail" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">{{ formatCurrency(product.price) }}</div>
              <div class="product-description">{{ product.description }}</div>
            </div>
          </div>
        </div>
      </div>
      <ul class="navbar-menu">
        <li class="navbar-item">
          <router-link to="/orders">Mes commandes</router-link>
        </li>
        <li class="navbar-item">
          <router-link to="/profile">Mon compte</router-link>
        </li>
      </ul>
      <router-link class="to-cart" to="/cart">
        <button class="btn btn-warning d-flex align-items-center">
          <i class="bi bi-cart me-2"></i>
          Mon panier
          <span :class="['cart-badge', badgeClass, 'ms-2']">{{ cartItemCount }}</span>
        </button>
      </router-link>
      <div v-if="isAuthenticated" class="dropdown custom-dropdown">
        <i
          class="button bi bi-person-circle dropdown-icon"
          type="button"
          id="authenticatedDropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        ></i>
        <div
          class="dropdown-menu dropdown-menu-end custom-dropdown-menu"
          aria-labelledby="authenticatedDropdownMenuButton"
        >
          <div class="dropdown-item custom-dropdown-item">
            <button class="btn btn-danger custom-btn" @click="logout">Se déconnecter</button>
          </div>
        </div>
      </div>
      <div v-else class="dropdown custom-dropdown">
        <i
          class="button bi bi-person-circle dropdown-icon"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        ></i>
        <div class="dropdown-menu dropdown-menu-end custom-dropdown-menu" aria-labelledby="dropdownMenuButton">
          <div class="dropdown-item custom-dropdown-item">
            <router-link to="/login">
              <button class="btn btn-primary custom-btn">Identifiez-vous</button>
            </router-link>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item custom-dropdown-item">Nouveau client ?</div>
          <div class="dropdown-item custom-dropdown-item">
            <router-link to="/register">
              <button class="btn btn-warning custom-btn">Créez votre compte</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
import { mapActions, mapGetters, useStore } from "vuex";
import { onMounted, ref, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.js";

export default {
  name: "NavBar",
  setup() {
    const store = useStore();
    const badgeClass = ref("");
    const searchQuery = ref("");
    const filteredProducts = ref([]);
    const hoveredIndex = ref(null);
    const router = useRouter();

    const searchDropdownRef = ref(null);

    const fetchProducts = async () => {
      try {
        await store.dispatch("product/fetchProducts");
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    const formatCurrency = (price) => {
      // You can implement your currency formatting logic here
      return `$${price.toFixed(2)}`; // Example format
    };

    const onSearchInput = () => {
      const query = searchQuery.value.toLowerCase();
      if (query) {
        filteredProducts.value = store.getters["product/allProducts"].filter((product) =>
          product.name.toLowerCase().startsWith(query)
        );
      } else {
        filteredProducts.value = [];
      }
    };

    const searchProducts = async () => {
      await fetchProducts();
      onSearchInput();
    };

    const selectProduct = (product) => {
      console.log(product);
      searchQuery.value = product.name;
      filteredProducts.value = [];
      router.push({ path: `/product/${product._id}` }); // Utilisez router.push au lieu de this.$router.push
    };

    const handleOutsideClick = (event) => {
      if (searchDropdownRef.value && !searchDropdownRef.value.contains(event.target)) {
        filteredProducts.value = [];
        searchQuery.value = ""; // Clear search input
      }
    };

    onMounted(async () => {
      if (store.getters["auth/isAuthenticated"]) {
        try {
          await store.dispatch("cart/fetchCart");
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      }

      var dropdownElementList = [].slice.call(document.querySelectorAll(".dropdown-toggle"));
      dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
      });

      document.addEventListener("click", handleOutsideClick);
    });

    watchEffect(() => {
      if (!searchQuery.value) {
        filteredProducts.value = [];
      }
    });

    watch(
      () => store.getters["cart/cartItemCount"],
      (newVal, oldVal) => {
        if (newVal > oldVal) {
          badgeClass.value = "increase";
        } else if (newVal < oldVal) {
          badgeClass.value = "decrease";
        }
        setTimeout(() => {
          badgeClass.value = "";
        }, 300);
      }
    );

    return {
      badgeClass,
      searchQuery,
      filteredProducts,
      hoveredIndex,
      onSearchInput,
      searchProducts,
      selectProduct,
      formatCurrency,
      searchDropdownRef,
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    ...mapGetters("cart", ["cartItemCount"]),
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    ...mapActions("cart", ["fetchCart"]),
  },
  watch: {
    isAuthenticated: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchCart();
        }
      },
    },
  },
};
</script>

<style scoped>
/* Ajoutez ou modifiez les styles suivants */
.custom-dropdown {
  display: flex;
  align-items: center;
}

.custom-dropdown-menu {
  min-width: 200px; /* Définir une largeur minimale pour les dropdowns */
  text-align: center; /* Centrer le contenu */
}

.custom-dropdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-btn {
  width: 100%;
  text-align: center;
  margin-bottom: 5px; /* Ajouter un espace entre les boutons */
}

.navbar {
  font-weight: bold;
  background: #293045; /* Primary color */
  padding: 10px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90px;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  justify-content: space-between; /* Modified to space between */
  align-items: center;
  width: 100%;
}

.brand-container {
  display: flex;
  flex-direction: column; /* Stack vertically */
  align-items: center; /* Center horizontally */
}

.navbar-brand {
  color: #ffffff; /* White color for logo text */
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
}

.navbar-brand:hover,
.navbar-brand:focus,
.navbar-brand:active {
  color: #ffffff;
}

.brand-subtitle {
  color: #ffffff;
  font-size: 12px; /* Adjust font size as needed */
  margin-top: 4px; /* Add space between title and subtitle */
}

.search-container {
  max-width: 800px;
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-left: 20px;
  margin-right: 20px;
  position: relative; /* Position relative to handle the dropdown */
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  outline: none;
  border: none;
}

/* Ajoutez ce style pour désactiver le bouton de recherche */
.btn-search-disabled {
  pointer-events: none; /* Désactive le clic */
  cursor: default; /* Curseur par défaut */
  background-color: #ccc; /* Change la couleur de fond pour indiquer que c'est désactivé */
}

/* Maintenez la couleur de l'icône de recherche */
.btn-search-disabled i {
  color: #000;
}

.btn-search {
  background-color: #ffc107;
  padding: 8px 16px;
  border: none;
  border-radius: 0 4px 4px 0;
}

.btn-search:hover,
.btn-search:focus,
.btn-search:active {
  background-color: #ffc107 !important;
}

.btn-search i {
  color: #000;
}

.selected:hover {
  background-color: rgba(230, 230, 230, 0.562) !important;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-item {
  margin-right: 20px;
}

.navbar-item a {
  color: #ffffff; /* White color for nav items */
  text-decoration: none;
  font-size: 16px;
}

.to-cart {
  text-decoration: none;
}

.cart-container {
  display: flex;
  align-items: center;
}

.btn-cart {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cart i {
  margin-right: 8px;
  color: #000;
}

.cart-badge {
  background-color: #fff; /* White background */
  color: #000; /* Black text */
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  transition: transform 0.3s ease-in-out; /* Smooth transition */
}

.cart-badge.increase {
  transform: scale(1.2);
}

.cart-badge.decrease {
  transform: scale(0.8);
}

.dropdown-icon {
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
}

.dropdown-menu {
  width: 100%; /* Adjust the width to match the search bar */
}

.dropdown-item {
  display: flex;
  align-items: center;
  flex-wrap: nowrap; /* Force items to stay in a single line */
  background-color: transparent; /* Default background color */
  transition: background-color 0.3s ease-in-out; /* Smooth transition */
  padding: 10px; /* Add padding for spacing */
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item:focus,
.dropdown-item:active,
.dropdown-item-hovered {
  background-color: rgba(255, 255, 255, 0.2); /* Background color on hover, focus and active */
}

.product-thumbnail {
  width: 50px; /* Set width for thumbnail */
  height: 50px; /* Set height for thumbnail */
  object-fit: cover; /* Ensure the image covers the container */
  margin-right: 10px; /* Space between image and text */
  border-radius: 4px; /* Rounded corners */
}

.product-info {
  flex-grow: 1; /* Allow text to take available space */
}

.product-name {
  font-weight: bold; /* Bold product name */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #ffc107; /* Highlight price */
}

.product-description {
  font-size: 14px; /* Smaller font for description */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-warning {
  width: 100%; /* Make the button take the full width */
}

.logout-container {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 0 0 4px 4px;
  display: none; /* Initially hide the dropdown */
}

.show.search-dropdown {
  display: block; /* Show the dropdown when active */
}

@media (max-width: 768px) {
  .navbar-menu {
    display: block;
    text-align: center;
  }

  .navbar-item {
    margin: 10px 0;
  }

  .navbar-item a {
    display: block;
    padding: 10px 0;
  }
}
</style>
