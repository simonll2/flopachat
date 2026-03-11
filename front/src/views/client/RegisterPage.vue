<!-- src/views/RegisterPage.vue -->
<template>
  <div class="register-page d-flex justify-content-center">
    <div class="card p-4 shadow-lg">
      <Register @registered="handleRegistrationSuccess" />
    </div>
  </div>
</template>

<script>
import Register from "../../components/Auth/Register.vue";
import { mapActions } from "vuex";

export default {
  name: "RegisterPage",
  components: {
    Register,
  },
  methods: {
    ...mapActions("auth", ["login"]),
    async handleRegistrationSuccess(form) {
      try {
        await this.login({ email: form.email, password: form.password });
        this.$router.push("/");
      } catch (error) {
        console.error("Error logging in user:", error);
      }
    },
  },
};
</script>

<style scoped>
.register-page {
  height: 100%;
  background-color: #f8f9fa;
  padding: 20px;
}
.card {
  margin-top: 30px;
  height: 750px;
  width: 800px;
}
</style>
