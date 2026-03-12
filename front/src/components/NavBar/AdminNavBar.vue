<template>
  <nav class="navbar fixed-top">
    <div class="navbar-container">
      <div class="brand-container">
        <router-link class="navbar-brand" to="/admin">Admin Dashboard</router-link>
      </div>
      <ul class="navbar-menu">
        <li class="navbar-item">
          <router-link to="/admin/products">Gestion des produits</router-link>
        </li>
        <li class="navbar-item">
          <router-link to="/admin/orders">Gestion des commandes</router-link>
        </li>
        <li class="navbar-item">
          <router-link to="/admin/users">Gestion des utilisateurs</router-link>
        </li>
        <li class="navbar-item">
          <router-link to="/admin/stats">Statistiques</router-link>
        </li>
      </ul>
      <div class="dropdown">
        <i
          class="button bi bi-person-circle dropdown-icon"
          type="button"
          id="adminDropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        ></i>
        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdownMenuButton">
          <div class="dropdown-item">
            <button class="btn btn-danger" @click="logout">Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "AdminNavBar",
  methods: {
    ...mapActions("auth", ["logout"]),
  },
};
</script>

<style scoped>
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.navbar-brand {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
}

.navbar-brand:hover,
.navbar-brand:focus,
.navbar-brand:active {
  color: #ffffff;
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
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
}

.dropdown-icon {
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
}

.dropdown-menu {
  width: 100%;
}

.dropdown-item {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  background-color: transparent;
  transition: background-color 0.3s ease-in-out;
  padding: 10px;
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item:focus,
.dropdown-item:active,
.dropdown-item-hovered {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
