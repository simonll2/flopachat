<template>
  <footer>
    <p class="text">
      FlopAchat, site de vente en ligne spécialiste en électronique. Nous vous proposons des produits high-tech et gamer
      avec un tas de nouveautés chaque jour ainsi qu'un matériel d'une qualité irréprochable ! <br />Les photos des
      produits sont conformes à la réalité. Se référer à la fiche détaillée du produit pour plus d'informations.
    </p>
    <p>&copy; {{ currentYear }} FlopAchat</p>
  </footer>
</template>

<script>
export default {
  name: "FooterBar",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>
footer {
  color: #ffffff;
  background: #293045 !important; /* Primary color */
  text-align: center;
  height: 90px;
  position: fixed;
  width: 100%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.text {
  margin-top: 20px;
  font-size: 14px;
}
</style>
