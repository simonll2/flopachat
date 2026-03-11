<template>
  <div class="register">
    <div class="d-flex flex-column align-items-center mb-4">
      <div class="d-flex align-items-center mb-2">
        <div class="image-upload-container d-flex flex-column align-items-center">
          <img :src="imagePreview || defaultImage" alt="Profile Image" class="profile-image mb-2" />
          <input type="file" class="form-control form-control-sm" id="image" @change="handleImageUpload" />
        </div>
      </div>
    </div>
    <form @submit.prevent="handleRegister">
      <p class="text-center">Créez un compte en remplissant le formulaire ci-dessous.</p>
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="email" class="form-label">Adresse e-mail:</label>
          <input type="email" class="form-control" id="email" v-model="form.email" required />
        </div>
        <div class="col-md-6">
          <label for="password" class="form-label">Mot de passe:</label>
          <input type="password" class="form-control" id="password" v-model="form.password" required />
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="firstName" class="form-label">Prénom:</label>
          <input type="text" class="form-control" id="firstName" v-model="form.firstName" required />
        </div>
        <div class="col-md-6">
          <label for="lastName" class="form-label">Nom:</label>
          <input type="text" class="form-control" id="lastName" v-model="form.lastName" required />
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
              v-model="form.address.street"
              placeholder="Rue"
              required
            />
          </div>
          <div class="col-md-6">
            <input
              type="text"
              class="form-control mb-1"
              id="city"
              v-model="form.address.city"
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
              v-model="form.address.state"
              placeholder="État"
              required
            />
          </div>
          <div class="col-md-6">
            <input
              type="text"
              class="form-control mb-1"
              id="postalCode"
              v-model="form.address.postalCode"
              placeholder="Code postal"
              required
            />
          </div>
        </div>
        <input
          type="text"
          class="form-control"
          id="country"
          v-model="form.address.country"
          placeholder="Pays"
          required
        />
      </div>
      <div class="d-flex justify-content-center">
        <button type="submit" class="btn btn-primary btn-lg" style="min-width: 150px">Créer un compte</button>
      </div>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Register",
  data() {
    return {
      form: {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      },
      image: null,
      imagePreview: null,
      defaultImage: "http://server-service.info/static/users/default-user.jpg",
      errorMessage: "", // Ajout de la variable pour le message d'erreur
    };
  },
  methods: {
    ...mapActions("auth", ["register"]),
    handleImageUpload(event) {
      this.image = event.target.files[0];
      this.imagePreview = URL.createObjectURL(this.image);
    },
    async handleRegister() {
      const formData = new FormData();
      for (const key in this.form) {
        if (typeof this.form[key] === "object" && this.form[key] !== null) {
          for (const subKey in this.form[key]) {
            formData.append(`address[${subKey}]`, this.form[key][subKey]);
          }
        } else {
          formData.append(key, this.form[key]);
        }
      }
      if (this.image) {
        formData.append("file", this.image);
      }
      try {
        await this.register(formData);
        this.$emit("registered", this.form);
      } catch (error) {
        console.error("Error registering user:", error);
        if (error.response && error.response.status === 409) {
          this.errorMessage = "Cette adresse e-mail est déjà utilisée.";
        } else {
          this.errorMessage = "Échec de l'enregistrement. Veuillez réessayer.";
        }
      }
    },
  },
};
</script>

<style scoped>
.register {
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

h1.h4 {
  font-size: 1.5rem;
}

.form-control-sm {
  max-width: 150px;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
  height: 20px; /* Fixe la hauteur pour ne pas changer la taille du conteneur */
}
</style>
