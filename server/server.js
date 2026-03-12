const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./lib/mongo");
const seedDatabase = require("./seed");
const fs = require("fs");
const path = require("path");

const app = express();

// Copier les fichiers statiques par défaut vers le PVC si vide
const { execSync } = require("child_process");
const staticDir = path.join(__dirname, "static");
const defaultDir = path.join(__dirname, "static-default");

if (!fs.existsSync(staticDir) || fs.readdirSync(staticDir).length === 0) {
  console.log("Static directory empty (PVC mount), copying defaults...");
  fs.mkdirSync(staticDir, { recursive: true });
  if (fs.existsSync(defaultDir)) {
    execSync(`cp -r ${defaultDir}/* ${staticDir}/`);
    console.log("Default static files copied.");
  }
} else {
  // S'assurer que les sous-dossiers existent
  ["users", "products", "carousel", "admin"].forEach((dir) => {
    const p = path.join(staticDir, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });
}

// Import des routes
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const orderRouter = require("./routes/orderRoute");
const cartRouter = require("./routes/cartRoute");
const paymentRouter = require("./routes/paymentRoute");

// Middlewares globaux
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://marketplace.local',
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
      params: req.query,
      timeout: 10000
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

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
db.once("open", async () => {
  console.log("Mongo is ready, starting seed...");
  await seedDatabase();
  console.log("Seed done, starting HTTP server...");

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
