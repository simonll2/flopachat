import ProductService from "../services/productService";

const state = {
  products: [],
  product: null,
  userVotedProducts: [],
};

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products;
  },
  SET_PRODUCT(state, product) {
    state.product = product;
  },
  SET_USER_VOTED_PRODUCTS(state, votedProducts) {
    state.userVotedProducts = votedProducts;
  },
  ADD_PRODUCT(state, product) {
    state.products.push(product);
  },
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex((product) => product._id === updatedProduct._id);
    if (index !== -1) {
      state.products.splice(index, 1, updatedProduct);
    }
  },
  DELETE_PRODUCT(state, productId) {
    state.products = state.products.filter((product) => product._id !== productId);
  },
};

const actions = {
  async fetchProducts({ commit }) {
    const response = await ProductService.getAllProducts();
    commit("SET_PRODUCTS", response.data);
  },
  async fetchProductById({ commit }, productId) {
    const response = await ProductService.getProductById(productId);
    commit("SET_PRODUCT", response.data);
    return response.data;
  },
  async fetchUserVotedProducts({ commit }) {
    try {
      const response = await ProductService.getUserVotedProducts();
      commit("SET_USER_VOTED_PRODUCTS", response.data);
    } catch (error) {
      console.error("Error fetching user voted products:", error);
    }
  },
  async updateProductThumbs({ commit, state }, { productId, type }) {
    const newValue = state.products.find((product) => product._id === productId)[type] + 1;
    const response = await ProductService.updateProductThumbs(productId, type, newValue);
    commit("UPDATE_PRODUCT_THUMBS", response.data);
  },
  async updateProduct({ commit }, { productId, product }) {
    const response = await ProductService.updateProduct(productId, product);
    commit("UPDATE_PRODUCT", response.data);
    return response.data;
  },
  async deleteProduct({ commit }, { productId }) {
    await ProductService.deleteProduct(productId);
    commit("DELETE_PRODUCT", productId);
  },
  async createProduct({ commit }, product) {
    const response = await ProductService.createProduct(product);
    commit("ADD_PRODUCT", response.data);
    return response.data;
  },
};

const getters = {
  allProducts: (state) => state.products,
  getProductById: (state) => (id) => state.products.find((product) => product._id === id),
  userVotedProducts: (state) => state.userVotedProducts,
  totalThumbsUp: (state) => {
    return state.products.reduce((total, product) => total + (product.thumbsUp || 0), 0);
  },
  totalThumbsDown: (state) => {
    return state.products.reduce((total, product) => total + (product.thumbsDown || 0), 0);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
