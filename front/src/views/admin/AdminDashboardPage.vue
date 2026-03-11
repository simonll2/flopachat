<template>
  <div class="admin-dashboard-page">
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from "../../components/Admin/Dashboard.vue";
import { mapActions } from "vuex";

export default {
  name: "AdminDashboardPage",
  components: {
    Dashboard,
  },
  async created() {
    try {
      await this.loadAdminData();
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  },
  methods: {
    ...mapActions(["loadAdminData"]),
  },
};
</script>

<style scoped>
.admin-dashboard-page {
  padding: 20px;
  background-color: #f8f9fa;
}
</style>
