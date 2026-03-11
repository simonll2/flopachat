<template>
  <div class="card product-card">
    <div class="image-container">
      <img :src="getImageSrc(productLocal.imagePath)" class="card-img-top" alt="Product Image" />
      <div class="overlay">
        <p class="description">{{ updatedDescription }}</p>
        <div class="d-flex justify-content-between">
          <button @click="showEditModal = true" class="btn btn-warning edit-btn mt-2">
            <i class="bi bi-pencil-fill text-white"></i>
          </button>
          <button @click="deleteProductHandler" class="btn btn-danger delete-btn mt-2">
            <i class="bi bi-trash-fill text-white"></i>
          </button>
        </div>
      </div>
      <span v-if="productLocal.stock === 0" class="badge bg-danger out-of-stock-badge">Rupture de stock</span>
      <span v-else class="badge bg-success in-stock-badge">En stock</span>
    </div>
    <div class="card-body d-flex flex-column">
      <div class="product-info">
        <h5 class="card-title">{{ updatedName }}</h5>
        <p class="card-text"><strong>Prix:</strong> {{ productLocal.price }} €</p>
        <div class="thumbs-container">
          <div class="thumbs-up">
            <i class="bi bi-hand-thumbs-up-fill text-success"></i>
            <span>{{ productLocal.thumbsUp }}</span>
          </div>
          <div class="thumbs-down">
            <i class="bi bi-hand-thumbs-down-fill text-danger"></i>
            <span>{{ productLocal.thumbsDown }}</span>
          </div>
        </div>
      </div>
    </div>
    <vue-final-modal v-model="showEditModal" :clickToClose="true" :escToClose="true">
      <template v-slot="{ close }">
        <div class="modal-content" ref="modalContent">
          <EditProductForm :product="productLocal" @product-updated="onProductUpdated" @close="close" />
          <button style="position: absolute; left: -9999px">Focus trap element</button>
        </div>
      </template>
    </vue-final-modal>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { VueFinalModal } from "vue-final-modal";
import EditProductForm from "./EditProductForm.vue";
import { mapActions } from "vuex";

export default {
  name: "AdminProduct",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const showEditModal = ref(false);
    const modalContent = ref(null);

    const closeEditModal = () => {
      showEditModal.value = false;
    };

    watch(showEditModal, (newValue) => {
      if (!newValue) {
        document.removeEventListener("click", handleClickOutside);
      } else {
        setTimeout(() => {
          document.addEventListener("click", handleClickOutside);
        }, 0);
      }
    });

    const handleClickOutside = (event) => {
      if (modalContent.value && !modalContent.value.contains(event.target)) {
        closeEditModal();
      }
    };

    return {
      showEditModal,
      modalContent,
      closeEditModal,
    };
  },
  data() {
    return {
      productLocal: { ...this.product },
    };
  },
  computed: {
    updatedName() {
      return this.productLocal.name;
    },
    updatedDescription() {
      return this.productLocal.description;
    },
  },
  methods: {
    ...mapActions("product", ["deleteProduct"]),
    getImageSrc(imagePath) {
      return imagePath
        ? `${imagePath}`
        : `/static/products/default-product.jpg`;
    },
    onProductUpdated(updatedProduct) {
      this.productLocal = { ...updatedProduct };
      this.showEditModal = false;
      this.$emit("product-updated");
    },
    async deleteProductHandler() {
      try {
        await this.deleteProduct({ productId: this.productLocal._id });
        this.$emit("product-updated");
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    },
  },
  components: {
    VueFinalModal,
    EditProductForm,
  },
};
</script>

<style scoped>
.product-card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  width: 250px;
  margin: 0 10px;
  position: relative;
}

.product-card:hover {
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

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
  height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-text {
  margin-bottom: 15px;
  height: 1.2em;
}

.description {
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}

.thumbs-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
}

.thumbs-down {
  margin-left: 10px;
}

.thumbs-up {
  margin-right: 10px;
}

.text-success {
  color: green;
}

.text-danger {
  color: red;
}

.in-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 5px;
}

.out-of-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.75rem;
  padding: 5px;
}

.modal-content {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  transition: background-color 0.2s ease-in-out;
}

.edit-btn i,
.delete-btn i {
  color: white;
}

.d-flex.justify-content-between > * {
  margin-right: 40px;
}

.d-flex.justify-content-between > *:last-child {
  margin-right: 0;
}
</style>
