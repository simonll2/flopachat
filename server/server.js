const express = require("express");
const cors = require("cors");
const axios = require("axios");
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
const paymentRouter = require("./routes/paymentRoute");

// Middlewares globaux
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "static")));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Proxy vers le stats-service
const STATS_SERVICE_URL = process.env.STATS_SERVICE_URL || 'http://stats-service:4000';

app.use('/api/stats', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${STATS_SERVICE_URL}/stats${req.path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { authorization: req.headers.authorization })
      },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({ error: 'Stats service unavailable' });
    }
  }
});

// Utilisation des routes
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", orderRouter);
app.use("/api", cartRouter);
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
