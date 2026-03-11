// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { createVfm } from "vue-final-modal";

const app = createApp(App);

app.use(router);
app.use(store);

const vfm = createVfm();
app.use(vfm);

store
  .dispatch("auth/validateToken")
  .catch((error) => {
    console.error("Token validation error during initialization:", error);
  })
  .finally(() => {
    app.mount("#app");
  });
