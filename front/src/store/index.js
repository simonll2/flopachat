import { createStore } from "vuex";
import auth from "./auth";
import cart from "./cart";
import order from "./order";
import product from "./product";
import persistState from "./plugins/persistState";

// Obtenez l'état initial de tous les modules
const getDefaultState = () => ({
  auth: auth.state,
  cart: cart.state,
  order: order.state,
  product: product.state,
});

const store = createStore({
  modules: {
    auth,
    cart,
    order,
    product,
  },
  plugins: [persistState],
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, getDefaultState());
    },
  },
  actions: {
    async loadAdminData({ dispatch }) {
      await dispatch("auth/fetchUsers");
      await dispatch("product/fetchProducts");
      await dispatch("order/fetchAllOrdersForAdmin");
    },
    resetState({ commit }) {
      commit("RESET_STATE");
    },
  },
});

export default store;
