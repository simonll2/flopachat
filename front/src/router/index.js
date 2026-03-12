import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import HomePage from "../views/client/HomePage.vue";
import LoginPage from "../views/client/LoginPage.vue";
import RegisterPage from "../views/client/RegisterPage.vue";
import ProfilePage from "../views/client/ProfilePage.vue";
import CartPage from "../views/client/CartPage.vue";
import OrderPage from "../views/client/OrderPage.vue";
import ProductDetailPage from "../views/client/ProductDetailPage.vue";
import PaymentPage from "../views/client/PaymentPage.vue";
import SuccessPage from "../views/client/SuccessPage.vue";
import store from "../store"; // Import the Vuex store

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", name: "Home", component: HomePage },
      { path: "login", name: "Login", component: LoginPage },
      { path: "register", name: "Register", component: RegisterPage },
      { path: "profile", name: "Profile", component: ProfilePage },
      { path: "cart", name: "Cart", component: CartPage },
      { path: "orders", name: "Orders", component: OrderPage },
      { path: "product/:id", name: "ProductDetail", component: ProductDetailPage },
      { path: "payment", name: "Payment", component: PaymentPage },
      { path: "success", name: "Success", component: SuccessPage },
    ],
  },
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", name: "AdminDashboard", component: () => import("../views/admin/AdminDashboardPage.vue") },
      { path: "products", name: "AdminProducts", component: () => import("../views/admin/AdminProductsPage.vue") },
      { path: "orders", name: "AdminOrders", component: () => import("../views/admin/AdminOrdersPage.vue") },
      { path: "users", name: "AdminUsers", component: () => import("../views/admin/AdminUsersPage.vue") },
      { path: "stats", name: "AdminStats", component: () => import("../views/admin/AdminStatsPage.vue") },
    ],
    beforeEnter: (to, from, next) => {
      if (store.getters["auth/isAuthenticated"] && store.getters["auth/isAdmin"]) {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Ajouter un hook beforeEach pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const protectedRoutes = ["Profile", "Cart", "Orders", "OrderDetail", "Payment", "Success"];

  if (protectedRoutes.includes(to.name) && !store.getters["auth/isAuthenticated"]) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
