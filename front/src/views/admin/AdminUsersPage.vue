<template>
  <div class="admin-user-page">
    <div class="user-container">
      <AdminBanner :page="'users'" @item-added="fetchUsers" />
      <UserList @user-updated="fetchUsers" />
    </div>
  </div>
</template>

<script>
import UserList from "../../components/Admin/AdminUserList.vue";
import AdminBanner from "../../components/Admin/AdminBanner.vue";
import { mapActions } from "vuex";

export default {
  name: "AdminUsersPage",
  components: {
    UserList,
    AdminBanner,
  },
  methods: {
    ...mapActions("auth", ["fetchUsers"]),
  },
};
</script>

<style scoped>
.admin-user-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 20px;
}

.user-container {
  border: 1px solid rgb(211, 211, 211);
  background-color: #ececec;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
}
</style>
