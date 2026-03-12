<template>
  <div class="stats-page">
    <h1>Statistiques</h1>

    <!-- Summary cards -->
    <div class="row mb-4" v-if="summary">
      <div class="col-md-3">
        <div class="info-card bg-success text-white">
          <div class="info-card-body">
            <div class="info-card-icon"><i class="bi bi-cash-stack"></i></div>
            <div class="info-card-content">
              <h2>{{ formatPrice(summary.totalSales) }}</h2>
              <p>Chiffre d'affaires</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="info-card bg-primary text-white">
          <div class="info-card-body">
            <div class="info-card-icon"><i class="bi bi-truck"></i></div>
            <div class="info-card-content">
              <h2>{{ summary.totalOrders }}</h2>
              <p>Commandes livrées</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="info-card bg-warning text-white">
          <div class="info-card-body">
            <div class="info-card-icon"><i class="bi bi-cart-check"></i></div>
            <div class="info-card-content">
              <h2>{{ formatPrice(summary.averageCart) }}</h2>
              <p>Panier moyen</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="info-card bg-secondary text-white">
          <div class="info-card-body">
            <div class="info-card-icon"><i class="bi bi-bar-chart-fill"></i></div>
            <div class="info-card-content">
              <h2>{{ summary.totalAllOrders }}</h2>
              <p>Total commandes</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders by status -->
    <div class="row mb-4" v-if="summary && summary.ordersByStatus">
      <div class="col-12">
        <div class="card">
          <div class="card-header"><strong>Répartition par statut</strong></div>
          <div class="card-body d-flex justify-content-around">
            <div class="text-center" v-for="(count, status) in summary.ordersByStatus" :key="status">
              <span class="badge" :class="statusBadgeClass(status)">{{ statusLabel(status) }}</span>
              <h3 class="mt-2">{{ count }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly revenue chart -->
    <div class="row mb-4" v-if="monthlyChartData">
      <div class="col-12">
        <div class="card">
          <div class="card-header"><strong>Chiffre d'affaires mensuel (commandes livrées)</strong></div>
          <div class="card-body">
            <BarChart :chartData="monthlyChartData" :chartOptions="monthlyChartOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Top products -->
    <div class="row mb-4" v-if="topProducts.length > 0">
      <div class="col-12">
        <div class="card">
          <div class="card-header"><strong>Top 5 produits les plus vendus</strong></div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produit</th>
                  <th>Quantité vendue</th>
                  <th>Nombre de commandes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in topProducts" :key="product.productId">
                  <td>{{ index + 1 }}</td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.totalQuantity }}</td>
                  <td>{{ product.orderCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from "../../components/Admin/BarChart.vue";
import StatsService from "../../services/statsService";

export default {
  name: "AdminStatsPage",
  components: { BarChart },
  data() {
    return {
      summary: null,
      monthlyStats: [],
      topProducts: [],
      loading: true,
    };
  },
  computed: {
    monthlyChartData() {
      if (!this.monthlyStats.length) return null;
      return {
        labels: this.monthlyStats.map((m) => m.month),
        datasets: [
          {
            label: "Chiffre d'affaires (€)",
            backgroundColor: "#42A5F5",
            data: this.monthlyStats.map((m) => m.revenue),
          },
          {
            label: "Nombre de commandes",
            backgroundColor: "#66BB6A",
            data: this.monthlyStats.map((m) => m.orders),
          },
        ],
      };
    },
    monthlyChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
      };
    },
  },
  methods: {
    formatPrice(value) {
      return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
    },
    statusLabel(status) {
      const labels = { pending: "En attente", completed: "Terminée", delivered: "Livrée" };
      return labels[status] || status;
    },
    statusBadgeClass(status) {
      const classes = { pending: "bg-warning", completed: "bg-primary", delivered: "bg-success" };
      return classes[status] || "bg-secondary";
    },
    async fetchStats() {
      this.loading = true;
      try {
        const [summaryRes, monthlyRes, topRes] = await Promise.all([
          StatsService.getSummary(),
          StatsService.getMonthlyStats(),
          StatsService.getTopProducts(),
        ]);
        this.summary = summaryRes.data;
        this.monthlyStats = monthlyRes.data;
        this.topProducts = topRes.data;
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchStats();
  },
};
</script>

<style scoped>
.stats-page {
  padding: 20px;
}
.info-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  margin: 10px 0;
}
.info-card:hover {
  transform: scale(1.05);
}
.info-card-body {
  display: flex;
  align-items: center;
  padding: 20px;
}
.info-card-icon {
  font-size: 2.5rem;
  margin-right: 20px;
}
.info-card-content {
  display: flex;
  flex-direction: column;
}
.info-card-content h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}
.info-card-content p {
  margin: 0;
  font-size: 1rem;
}
</style>
