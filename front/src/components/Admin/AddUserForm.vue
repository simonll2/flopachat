<template>
  <div class="add-user-form">
    <h3>Ajouter un utilisateur</h3>
    <div class="d-flex flex-column align-items-center mb-4">
      <div class="d-flex align-items-center mb-2">
        <div class="image-upload-container d-flex flex-column align-items-center">
          <img :src="imagePreview || defaultImage" alt="Profile Image" class="profile-image mb-2" />
          <input type="file" class="form-control form-control-sm" id="image" @change="handleFileUpload" />
        </div>
      </div>
    </div>
    <form @submit.prevent="submitForm">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="firstName" class="form-label">Prénom:</label>
          <input type="text" class="form-control" id="firstName" v-model="user.firstName" required />
        </div>
        <div class="col-md-6">
          <label for="lastName" class="form-label">Nom:</label>
          <input type="text" class="form-control" id="lastName" v-model="user.lastName" required />
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="email" class="form-label">Adresse e-mail:</label>
          <input type="email" class="form-control" id="email" v-model="user.email" required />
        </div>
        <div class="col-md-6">
          <label for="password" class="form-label">Mot de passe:</label>
          <input type="password" class="form-control" id="password" v-model="user.password" required />
        </div>
      </div>
      <div class="mb-3">
        <label for="address" class="form-label">Adresse:</label>
        <div class="row">
          <div class="col-md-6">
            <input
              type="text"
              class="form-control mb-1"
              id="street"
              v-model="user.address.street"
              placeholder="Rue"
              required
            />
          </div>
          <div class="col-md-6">
            <input
              type="text"
              class="form-control mb-1"
              id="city"
              v-model="user.address.city"
              placeholder="Ville"
              required
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <input
              type="text"
              class="form-control mb-1"
              id="state"
              v-model="user.address.state"
              placeholder="État"
              required
            />
          </div>
          <div class="col-md-6">
            <input
              type="text"
              class="form-control mb-1"
              id="postalCode"
              v-model="user.address.postalCode"
              placeholder="Code postal"
              required
            />
          </div>
        </div>
        <input
          type="text"
          class="form-control"
          id="country"
          v-model="user.address.country"
          placeholder="Pays"
          required
        />
      </div>
      <div class="form-group">
        <label for="role">Rôle</label>
        <select v-model="user.role" id="role" required>
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>
      <div class="d-flex justify-content-center">
        <button type="submit" class="btn btn-primary btn-lg" style="min-width: 150px">Ajouter</button>
      </div>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import AuthService from "../../services/authService";

export default {
  name: "AddUserForm",
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      },
      imageFile: null,
      imagePreview: null,
      defaultImage: "http://server-service.info/static/users/default-user.jpg",
      error: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
      this.imagePreview = URL.createObjectURL(this.imageFile);
    },
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append("firstName", this.user.firstName);
        formData.append("lastName", this.user.lastName);
        formData.append("email", this.user.email);
        formData.append("password", this.user.password);
        formData.append("role", this.user.role);
        for (const key in this.user.address) {
          formData.append(`address[${key}]`, this.user.address[key]);
        }
        if (this.imageFile) {
          formData.append("file", this.imageFile);
        }
        await AuthService.register(formData);
        this.$emit("item-added");
      } catch (error) {
        console.error("Failed to add user:", error);
        if (error.response && error.response.status === 403) {
          this.error = "Vous n'avez pas les droits nécessaires pour ajouter un utilisateur.";
        } else {
          this.error = "Une erreur est survenue lors de l'ajout de l'utilisateur.";
        }
      }
    },
  },
};
</script>

<style scoped>
.add-user-form {
  padding: 20px;
}

.image-upload-container {
  text-align: center;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

h3 {
  font-size: 1.5rem;
}

.form-control-sm {
  max-width: 150px;
}

.error {
  margin-top: 10px;
  color: red;
  text-align: center;
  height: 20px; /* Fixe la hauteur pour ne pas changer la taille du conteneur */
}
</style>
