<template>
  <div class="card user-card">
    <div class="image-container">
      <img :src="getImageSrc(userLocal.imagePath)" class="card-img-top" alt="User Image" />
      <div class="overlay">
        <p class="description">{{ userLocal.firstName }} {{ userLocal.lastName }}</p>
        <div class="d-flex">
          <button @click="deleteUserHandler" class="btn btn-danger mt-2 ms-2">
            <i class="bi bi-trash-fill text-white"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="card-body d-flex flex-column">
      <div class="user-info">
        <h5 class="card-title">{{ userLocal.firstName }} {{ userLocal.lastName }}</h5>
        <p class="card-text"><strong>Email:</strong> {{ userLocal.email }}</p>
        <p class="card-text"><strong>Rôle:</strong> {{ userLocal.role }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "AdminUser",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      userLocal: { ...this.user },
    };
  },
  methods: {
    ...mapActions("auth", ["deleteUser"]),
    getImageSrc(imagePath) {
      return imagePath ? `http://server-service.info${imagePath}` : `http://server-service.info/static/users/default-user.jpg`;
    },
    async deleteUserHandler() {
      try {
        await this.deleteUser({ userId: this.userLocal._id });
        this.$emit("user-updated");
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    },
  },
};
</script>

<style scoped>
.user-card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  width: 250px;
  margin: 0 10px;
  position: relative;
}

.user-card:hover {
  transform: scale(1.05);
}

.image-container {
  position: relative;
  overflow: hidden;
  padding-top: 8px;
}

.card-img-top {
  height: 200px;
  width: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  transition: opacity 0.3s ease-in-out;
}

.image-container:hover .overlay {
  opacity: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.card-text {
  margin-bottom: 15px;
}

.btn {
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  margin-left: 10px;
}

.btn:hover {
  filter: brightness(1.1);
}
</style>
