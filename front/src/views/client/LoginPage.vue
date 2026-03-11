<!-- src/views/LoginPage.vue -->
<template>
  <div class="login-page d-flex justify-content-center">
    <div class="card p-4 shadow-lg">
      <h1 class="text-center mb-4">Identifiez-vous</h1>
      <p class="text-center">Nouveau client ? <router-link to="/register">Créez un compte</router-link></p>
      <Login @loggedIn="handleLoginSuccess" />
    </div>
  </div>
</template>

<script>
import Login from "../../components/Auth/Login.vue";

export default {
  name: "LoginPage",
  components: {
    Login,
  },
  methods: {
    handleLoginSuccess() {
      // Redirect to home page or profile page after successful login
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.login-page {
  height: 100%;
  background-color: #f8f9fa;
  padding: 20px;
}
.card {
  margin-top: 30px;
  height: 500px;
  width: 800px;
}
</style>
