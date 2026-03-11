<template>
  <div class="edit-product-form">
    <h3>Modifier le produit</h3>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Nom du produit</label>
        <input type="text" v-model="productLocal.name" id="name" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea v-model="productLocal.description" id="description" required></textarea>
      </div>
      <div class="form-group">
        <label for="price">Prix</label>
        <input type="number" v-model="productLocal.price" id="price" required />
      </div>
      <div class="form-group">
        <label for="stock">Stock</label>
        <input type="number" v-model="productLocal.stock" id="stock" required />
      </div>
      <div class="form-group">
        <label for="file">Image</label>
        <input type="file" @change="handleFileUpload" id="file" name="file" />
      </div>
      <button type="submit" class="btn btn-primary">Modifier</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "EditProductForm",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      productLocal: { ...this.product }, // Créer une copie locale de la prop
      imageFile: null,
      error: null,
    };
  },
  methods: {
    ...mapActions("product", ["updateProduct"]),
    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
    },
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append("name", this.productLocal.name);
        formData.append("description", this.productLocal.description);
        formData.append("price", this.productLocal.price);
        formData.append("stock", this.productLocal.stock);
        if (this.imageFile) {
          formData.append("file", this.imageFile);
        }
        const updatedProduct = await this.updateProduct({ productId: this.productLocal._id, product: formData });
        this.$emit("product-updated", updatedProduct);
        this.$emit("close");
      } catch (error) {
        console.error("Failed to update product:", error);
        if (error.response && error.response.status === 403) {
          this.error = "Vous n'avez pas les droits nécessaires pour modifier ce produit.";
        } else {
          this.error = "Une erreur est survenue lors de la modification du produit.";
        }
      }
    },
  },
};
</script>

<style scoped>
.edit-product-form {
  padding: 20px;
}

.edit-product-form .form-group {
  margin-bottom: 15px;
}

.edit-product-form label {
  display: block;
  margin-bottom: 5px;
}

.edit-product-form input,
.edit-product-form textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.error {
  margin-top: 10px;
  color: red;
  font-weight: bold;
}
</style>
