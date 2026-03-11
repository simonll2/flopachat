<template>
  <div class="add-product-form">
    <h3>Ajouter un produit</h3>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Nom du produit</label>
        <input type="text" v-model="product.name" id="name" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea v-model="product.description" id="description" required></textarea>
      </div>
      <div class="form-group">
        <label for="price">Prix</label>
        <input type="number" v-model="product.price" id="price" required />
      </div>
      <div class="form-group">
        <label for="stock">Stock</label>
        <input type="number" v-model="product.stock" id="stock" required />
      </div>
      <div class="form-group">
        <label for="file">Image</label>
        <input type="file" @change="handleFileUpload" id="file" name="file" />
      </div>
      <button type="submit" class="btn btn-primary">Ajouter</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import ProductService from "../../services/productService";

export default {
  name: "AddProductForm",
  data() {
    return {
      product: {
        name: "",
        description: "",
        price: 0,
        stock: 0,
      },
      imageFile: null,
      error: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
    },
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append("name", this.product.name);
        formData.append("description", this.product.description);
        formData.append("price", this.product.price);
        formData.append("stock", this.product.stock);
        if (this.imageFile) {
          formData.append("file", this.imageFile);
        }
        await ProductService.createProduct(formData);
        this.$emit("item-added");
      } catch (error) {
        console.error("Failed to add product:", error);
        if (error.response && error.response.status === 403) {
          this.error = "Vous n'avez pas les droits nécessaires pour ajouter un produit.";
        } else {
          this.error = "Une erreur est survenue lors de l'ajout du produit.";
        }
      }
    },
  },
};
</script>

<style scoped>
.add-product-form {
  padding: 20px;
}

.add-product-form .form-group {
  margin-bottom: 15px;
}

.add-product-form label {
  display: block;
  margin-bottom: 5px;
}

.add-product-form input,
.add-product-form textarea {
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
