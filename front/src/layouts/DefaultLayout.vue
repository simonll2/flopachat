<template>
  <div class="default-layout">
    <header>
      <NavBar />
    </header>
    <main>
      <router-view></router-view>
    </main>
    <footer v-if="!isHomePage">
      <FooterBar />
    </footer>
  </div>
</template>

<script>
import NavBar from "../components/NavBar/NavBar.vue";
import FooterBar from "../components/FooterBar/FooterBar.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

export default {
  name: "DefaultLayout",
  components: {
    NavBar,
    FooterBar,
  },
  setup() {
    const route = useRoute();
    const isHomePage = computed(() => route.name === "Home");

    return {
      isHomePage,
    };
  },
};
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background: #f8f8f8;
}

main {
  flex: 1; /* This makes sure main takes up the remaining space */
  padding-top: 110px; /* Ensure content is below the fixed navbar */
  padding-bottom: 90px; /* Ensure content is above the fixed footer */
  padding-left: 20px;
  padding-right: 20px;
}

footer {
  background: #f8f8f8;
}
</style>
