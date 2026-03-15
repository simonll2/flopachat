import AuthService from "../services/authService";
import router from "../router"; // Assurez-vous d'importer votre routeur
import { getToken, getUserIdFromToken } from "../utils/auth";

const state = {
  user: null,
  users: [],
  token: localStorage.getItem("token") || "",
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_USERS(state, users) {
    state.users = users;
  },
  SET_TOKEN(state, token) {
    state.token = token;
    localStorage.setItem("token", token);
  },
  CLEAR_TOKEN(state) {
    state.token = "";
    localStorage.removeItem("token");
  },
};

const actions = {
  async register({ commit }, user) {
    const response = await AuthService.register(user);
    commit("SET_USER", response.data.user);
    commit("SET_TOKEN", response.data.token);
    return response;
  },
  async login({ commit, dispatch }, user) {
    const response = await AuthService.login(user);
    commit("SET_TOKEN", response.data.token);
    await dispatch("fetchUserProfile"); // Récupérer les informations de l'utilisateur après avoir défini le token
    return response;
  },
  async validateToken({ commit }) {
    const token = getToken();
    if (token) {
      try {
        const response = await AuthService.validateToken(token);
        commit("SET_USER", response.data.user);
      } catch (error) {
        console.error("Token validation failed:", error);
        commit("SET_USER", null);
        commit("CLEAR_TOKEN");
        throw error;
      }
    }
  },
  async fetchUserProfile({ commit }) {
    try {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error("User ID not found in token");
      const response = await AuthService.getUserProfile(userId);
      commit("SET_USER", response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  },
  async fetchUsers({ commit }) {
    try {
      const response = await AuthService.getAllUsers();
      commit("SET_USERS", response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  },
  async updateUser({ commit }, formData) {
    const userId = formData.get("_id"); // Récupère l'ID utilisateur depuis FormData
    formData.delete("_id"); // Supprime l'ID utilisateur du FormData pour éviter les doublons
    const response = await AuthService.updateUser(userId, formData);
    commit("SET_USER", response.data);
    return response;
  },
  async deleteUser({ dispatch }, { userId }) {
    try {
      await AuthService.deleteUser(userId);
      await dispatch("fetchUsers");
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  },
  logout({ commit, dispatch }) {
    commit("SET_USER", null);
    commit("CLEAR_TOKEN");
    localStorage.removeItem("token");
    localStorage.removeItem("store");
    dispatch("resetState", null, { root: true });
    router.push("/login");
  },
};

const getters = {
  isAuthenticated: (state) => !!state.token,
  getUser: (state) => state.user,
  isAdmin: (state) => state.user && state.user.role === "admin",
  allUsers: (state) => state.users,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
