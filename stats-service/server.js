const express = require('express');
const cors = require('cors');
const db = require('./lib/mongo');
const { getStatistics, getSummary, getMonthlyStats, getTopProducts } = require('./controllers/statsController');

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://marketplace.local',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Stats routes (no auth — auth is verified by the main server proxy)
app.get('/stats', getStatistics);
app.get('/stats/summary', getSummary);
app.get('/stats/monthly', getMonthlyStats);
app.get('/stats/top-products', getTopProducts);

const PORT = process.env.PORT || 4000;
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Stats service running on port ${PORT}`);
  });
});
