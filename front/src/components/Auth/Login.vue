<template>
  <div class="login">
    <form @submit.prevent="handleLogin">
      <p class="text-center">
        Connectez-vous avec votre adresse e-mail et votre mot de passe pour accéder à votre espace client.
      </p>
      <div class="mb-3">
        <label for="email" class="form-label">Adresse e-mail:</label>
        <input type="email" class="form-control" id="email" v-model="form.email" required />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Mot de passe:</label>
        <input type="password" class="form-control" id="password" v-model="form.password" required />
      </div>
      <div class="d-flex justify-content-center">
        <button type="submit" class="btn btn-primary btn-lg" style="min-width: 150px">Se connecter</button>
      </div>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Login",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      errorMessage: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "isAdmin"]),
  },
  methods: {
    ...mapActions("auth", ["login"]),
    async handleLogin() {
      try {
        await this.login(this.form);

        if (this.isAdmin) {
          this.$router.push("/admin");
        } else {
          this.$router.push("/");
        }
      } catch (error) {
        console.error("Error logging in user:", error);
        this.errorMessage = "Adresse e-mail ou mot de passe incorrect.";
      }
    },
  },
};
</script>

<style scoped>
.login {
  padding: 20px;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
  height: 20px;
}
</style>
