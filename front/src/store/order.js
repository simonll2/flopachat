// src/store/modules/orders.js
import OrderService from "../services/orderService";

const state = {
  orders: [],
  order: null,
};

const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders;
  },
  SET_ORDER(state, order) {
    state.order = order;
  },
  ADD_ORDER(state, order) {
    state.orders.push(order);
  },
};

const actions = {
  async fetchOrders({ commit }) {
    try {
      const response = await OrderService.getAllOrders();
      commit("SET_ORDERS", response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  },
  async fetchAllOrdersForAdmin({ commit }) {
    try {
      const response = await OrderService.getAllOrdersForAdmin();
      commit("SET_ORDERS", response.data);
    } catch (error) {
      console.error("Failed to fetch all orders for admin:", error);
    }
  },
  async fetchOrderById({ commit }, orderId) {
    try {
      const response = await OrderService.getOrderById(orderId);
      commit("SET_ORDER", response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
  },
  async confirmOrder(_, sessionId) {
    try {
      await OrderService.confirmOrder(sessionId);
    } catch (error) {
      console.error("Failed to confirm order:", error);
      throw error;
    }
  },
};

const getters = {
  allOrders: (state) => state.orders,
  order: (state) => state.order,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
