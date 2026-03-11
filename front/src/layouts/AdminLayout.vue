<template>
  <div class="admin-layout">
    <header>
      <AdminNavBar />
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "../components/NavBar/AdminNavBar.vue";

export default {
  name: "AdminLayout",
  components: {
    AdminNavBar,
  },
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background: #293045;
}

main {
  flex: 1;
  padding: 20px;
}
</style>
