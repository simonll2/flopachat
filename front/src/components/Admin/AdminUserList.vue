<template>
  <div class="user-list row">
    <AdminUser
      v-for="user in users"
      :key="user._id"
      :user="user"
      class="col-md-4 mb-4 px-2"
      @user-updated="fetchUsers"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import AdminUser from "./AdminUser.vue";

export default {
  name: "AdminUserList",
  components: {
    AdminUser,
  },
  computed: {
    ...mapGetters("auth", ["allUsers"]),
    users() {
      return this.allUsers;
    },
  },
  methods: {
    ...mapActions("auth", ["fetchUsers"]),
  },
  async created() {
    try {
      await this.fetchUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },
};
</script>

<style scoped>
.user-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
</style>
