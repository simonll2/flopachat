<template>
  <div class="admin-banner card shadow-sm p-4 mb-4 bg-white rounded d-flex flex-row">
    <img :src="bannerImage" alt="Admin" class="admin-image me-4" />
    <div class="card-body d-flex flex-column justify-content-center align-items-start text-left">
      <h2 class="card-title text-primary mb-4">{{ pageTitle }}</h2>
      <div class="d-flex flex-column w-100">
        <p class="card-text mb-4">En tant qu'administrateur, vous pouvez :</p>
        <ul class="list-group list-group-flush mb-4">
          <li v-for="(action, index) in pageActions" :key="index" class="list-group-item d-flex align-items-center">
            <i :class="action.iconClass" class="me-2"></i> {{ action.text }}
          </li>
        </ul>
        <button v-if="showAddButton" @click="showModal = true" class="btn btn-primary btn-lg align-self-start">
          <i class="bi bi-plus-lg"></i> {{ addButtonText }}
        </button>
      </div>
      <vue-final-modal v-model="showModal" :clickToClose="true" :escToClose="true">
        <template v-slot="{ close }">
          <div class="modal-content" ref="modalContent">
            <component :is="modalComponent" @item-added="onItemAdded" @close="close" />
          </div>
        </template>
      </vue-final-modal>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { VueFinalModal } from "vue-final-modal";
import AddProductForm from "./AddProductForm.vue";
import AddUserForm from "./AddUserForm.vue";

export default {
  name: "AdminBanner",
  components: {
    AddProductForm,
    AddUserForm,
    VueFinalModal,
  },
  props: {
    page: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showModal = ref(false);
    const modalContent = ref(null);

    const onItemAdded = () => {
      showModal.value = false;
      emit("item-added");
    };

    const closeEditModal = () => {
      showModal.value = false;
    };

    watch(showModal, (newValue) => {
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

    const bannerImage = computed(() => {
      switch (props.page) {
        case "products":
          return "http://server-service.info/static/admin/admin.jpg";
        case "orders":
          return "http://server-service.info/static/admin/jp.jpg";
        case "users":
          return "http://server-service.info/static/admin/bastos.jpg";
        default:
          return "http://server-service.info/static/admin/admin.jpg";
      }
    });

    const pageTitle = computed(() => {
      switch (props.page) {
        case "products":
          return "Gestion des Produits";
        case "users":
          return "Gestion des Utilisateurs";
        case "orders":
          return "Gestion des Commandes";
        default:
          return "Gestion Administrative";
      }
    });

    const addButtonText = computed(() => {
      return props.page === "products" ? "Ajouter un produit" : props.page === "users" ? "Ajouter un utilisateur" : "";
    });

    const showAddButton = computed(() => {
      return props.page === "products" || props.page === "users";
    });

    const modalComponent = computed(() => {
      return props.page === "products" ? "AddProductForm" : "AddUserForm";
    });

    const pageActions = computed(() => {
      switch (props.page) {
        case "products":
          return [
            { iconClass: "bi bi-plus-circle-fill text-success", text: "Ajouter de nouveaux produits" },
            { iconClass: "bi bi-pencil-fill text-warning", text: "Modifier les produits existants" },
            { iconClass: "bi bi-trash-fill text-danger", text: "Supprimer les produits" },
            { iconClass: "bi bi-bar-chart-fill text-info", text: "Voir les statistiques des produits" },
          ];
        case "users":
          return [
            { iconClass: "bi bi-plus-circle-fill text-success", text: "Ajouter de nouveaux utilisateurs" },
            { iconClass: "bi bi-trash-fill text-danger", text: "Supprimer les utilisateurs" },
          ];
        case "orders":
          return [{ iconClass: "bi bi-bar-chart-fill text-info", text: "Voir les statistiques des commandes" }];
        default:
          return [];
      }
    });

    return {
      showModal,
      modalContent,
      onItemAdded,
      pageTitle,
      addButtonText,
      showAddButton,
      modalComponent,
      pageActions,
      closeEditModal,
      bannerImage,
    };
  },
};
</script>

<style scoped>
.admin-banner {
  height: 475px;
  background-color: #f8f9fa;
  display: flex;
  align-items: stretch;
  padding: 0;
}

.admin-image {
  width: 700px;
  height: auto;
  border-radius: 8px 0 0 8px;
}

.card-body {
  margin-left: 50px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  padding: 20px;
}

.card-title {
  font-size: 1.75rem;
  font-weight: bold;
}

.card-text {
  font-size: 1.25rem;
}

.list-group-item {
  font-size: 1rem;
  padding: 0.75rem 1.25rem;
  border: none;
}

.btn-lg {
  font-size: 1.25rem;
  padding: 0.75rem 1.5rem;
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
</style>
