const express = require("express");
const cors = require("cors");
const db = require("./lib/mongo");
const seedDatabase = require("./seed");
const fs = require("fs");
const path = require("path");

const app = express();

// Vérifier et créer les répertoires si nécessaire
const directories = ["static", "static/users", "static/products"];
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
// Import des routes
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const orderRouter = require("./routes/orderRoute");
const cartRouter = require("./routes/cartRoute");
const statsRouter = require("./routes/statsRoute");
const paymentRouter = require("./routes/paymentRoute");

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "static"))); // Servir les fichiers statiques du répertoire 'static'

// Utilisation des routes
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", orderRouter);
app.use("/api", cartRouter);
app.use("/api", statsRouter);
app.use("/api", paymentRouter);

// Démarrage du serveur
const PORT = 5000;
db.once("open", async () => {
  console.log("Mongo is ready, starting seed...");
  await seedDatabase();
  console.log("Seed done, starting HTTP server...");

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
