<template>
  <div class="profile-page d-flex justify-content-center">
    <div class="card p-4 shadow-lg">
      <Profile />
    </div>
  </div>
</template>

<script>
import Profile from "../../components/Auth/Profile.vue";

export default {
  name: "ProfilePage",
  components: {
    Profile,
  },
};
</script>

<style scoped>
.profile-page {
  height: 100%;
  background-color: #f8f9fa;
  padding: 20px;
}
.card {
  margin-top: 30px;
  height: auto;
  width: 800px;
}
</style>
