<template>
  <div class="profile">
    <div class="d-flex flex-column align-items-center mb-4">
      <div class="d-flex align-items-center mb-2">
        <div class="image-upload-container d-flex flex-column align-items-center">
          <img :src="imagePreview || getImageSrc()" alt="Profile Image" class="profile-image mb-2" />
          <input type="file" class="form-control form-control-sm" id="image" @change="handleImageUpload" />
        </div>
      </div>
    </div>
    <form @submit.prevent="updateProfile">
      <p class="text-center">Mettez à jour votre profil en remplissant le formulaire ci-dessous.</p>
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="email" class="form-label">Adresse e-mail:</label>
          <input type="email" class="form-control" id="email" v-model="form.email" required />
        </div>
        <div class="col-md-6">
          <label for="firstName" class="form-label">Prénom:</label>
          <input type="text" class="form-control" id="firstName" v-model="form.firstName" required />
        </div>
      </div>
      <div class="row mb-3">
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
        <button type="submit" class="btn btn-primary btn-lg" style="min-width: 150px">Mettre à jour</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "Profile",
  data() {
    return {
      form: {
        email: "",
        firstName: "",
        lastName: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        imagePath: null,
      },
      image: null,
      imagePreview: null,
    };
  },
  computed: {
    ...mapState("auth", {
      user: (state) => state.user,
    }),
  },
  watch: {
    user: {
      handler(newUser) {
        if (newUser) {
          this.form = { ...newUser };
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (!this.user) {
      this.fetchUserProfile();
    } else {
      this.form = { ...this.user };
    }
  },
  methods: {
    ...mapActions("auth", ["updateUser", "fetchUserProfile"]),
    handleImageUpload(event) {
      this.image = event.target.files[0];
      this.imagePreview = URL.createObjectURL(this.image);
    },
    getImageSrc() {
      return this.form.imagePath
        ? `${this.form.imagePath}`
        : `/static/users/default-user.jpg`;
    },
    async updateProfile() {
      const formData = new FormData();
      formData.append("_id", this.user._id); // Ajouter l'ID utilisateur au FormData une seule fois
      for (const key in this.form) {
        if (key !== "_id") {
          // Ne pas ajouter _id deux fois
          if (typeof this.form[key] === "object" && this.form[key] !== null) {
            for (const subKey in this.form[key]) {
              formData.append(`address[${subKey}]`, this.form[key][subKey]);
            }
          } else {
            formData.append(key, this.form[key]);
          }
        }
      }
      if (this.image) {
        formData.append("file", this.image);
      }
      try {
        await this.updateUser(formData);
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error);
        } else {
          alert("Failed to update profile.");
        }
      }
    },
  },
};
</script>

<style scoped>
.profile {
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
</style>
