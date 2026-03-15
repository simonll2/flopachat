// src/store/cart.js
import CartService from "../services/cartService";
import PaymentService from "../services/paymentService";

const state = {
  cart: {
    products: [],
    total: 0,
  },
};

const mutations = {
  SET_CART(state, cart) {
    state.cart = cart;
  },
  ADD_TO_CART(state, item) {
    const existingItem = state.cart.products.find((product) => product.product._id === item.product._id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      state.cart.products.push(item);
    }
    state.cart.total += item.product.price * item.quantity;
  },
  UPDATE_CART(state, { productId, quantity }) {
    const itemIndex = state.cart.products.findIndex((product) => product.product._id === productId);
    if (itemIndex > -1) {
      const item = state.cart.products[itemIndex];
      state.cart.total -= item.product.price * item.quantity;
      if (quantity < 1) {
        state.cart.products.splice(itemIndex, 1);
      } else {
        item.quantity = quantity;
        state.cart.total += item.product.price * quantity;
      }
    }
  },
  DELETE_FROM_CART(state, productId) {
    const itemIndex = state.cart.products.findIndex((product) => product.product._id === productId);
    if (itemIndex > -1) {
      const item = state.cart.products[itemIndex];
      state.cart.total -= item.product.price * item.quantity;
      state.cart.products.splice(itemIndex, 1);
    }
  },
  CLEAR_CART(state) {
    state.cart.products = [];
    state.cart.total = 0;
  },
};

const actions = {
  async fetchCart({ commit }) {
    try {
      const response = await CartService.getCart();
      commit("SET_CART", response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      commit("SET_CART", { products: [], total: 0 }); // Assurez-vous que le store gère le panier vide
    }
  },
  async addToCart({ dispatch }, { productId, quantity }) {
    try {
      await CartService.addToCart(productId, quantity);
      await dispatch("fetchCart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  },
  async updateCart({ dispatch }, { productId, quantity }) {
    try {
      if (quantity < 1) {
        await CartService.deleteFromCart(productId);
      } else {
        await CartService.updateCart(productId, quantity);
      }
      await dispatch("fetchCart");
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  },
  async deleteFromCart({ dispatch }, productId) {
    try {
      await CartService.deleteFromCart(productId);
      await dispatch("fetchCart");
    } catch (error) {
      console.error("Failed to delete from cart:", error);
    }
  },
  async checkout({ state }) {
    try {
      const items = state.cart.products.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price * 100, // Convert to cents
      }));
      const session = await PaymentService.createCheckoutSession(items);
      PaymentService.redirectToCheckout(session.url);
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  },
  clearCart({ commit }) {
    commit("CLEAR_CART");
  },
};

const getters = {
  cart: (state) => state.cart,
  cartItemCount: (state) => {
    return state.cart.products.reduce((acc, item) => acc + item.quantity, 0);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
