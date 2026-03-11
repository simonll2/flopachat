<template>
  <div class="dashboard">
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="info-card bg-primary text-white">
          <div class="info-card-body">
            <div class="info-card-icon">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="info-card-content">
              <h2>{{ totalUsers }}</h2>
              <p>Registered Customers</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="info-card bg-warning text-white">
          <div class="info-card-body">
            <div class="info-card-icon">
              <i class="bi bi-cart-fill"></i>
            </div>
            <div class="info-card-content">
              <h2>{{ totalProducts }}</h2>
              <p>Total Products</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="info-card bg-secondary text-white">
          <div class="info-card-body">
            <div class="info-card-icon">
              <i class="bi bi-bar-chart-fill"></i>
            </div>
            <div class="info-card-content">
              <h2>{{ totalOrders }}</h2>
              <p>Total Orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-12">
        <BarChart :chartData="chartData" :chartOptions="chartOptions" />
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="info-card bg-success text-white">
          <div class="info-card-body">
            <div class="info-card-icon">
              <i class="bi bi-hand-thumbs-up-fill"></i>
            </div>
            <div class="info-card-content">
              <h2>{{ totalThumbsUp }}</h2>
              <p>Total Thumbs Up</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="info-card bg-danger text-white">
          <div class="info-card-body">
            <div class="info-card-icon">
              <i class="bi bi-hand-thumbs-down-fill"></i>
            </div>
            <div class="info-card-content">
              <h2>{{ totalThumbsDown }}</h2>
              <p>Total Thumbs Down</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import BarChart from "./BarChart.vue";

export default {
  name: "Dashboard",
  components: {
    BarChart,
  },
  computed: {
    ...mapGetters("auth", ["allUsers"]),
    ...mapGetters("product", ["allProducts", "totalThumbsUp", "totalThumbsDown"]),
    ...mapGetters("order", ["allOrders"]),
    totalUsers() {
      return this.allUsers ? this.allUsers.length : 0;
    },
    totalProducts() {
      return this.allProducts ? this.allProducts.length : 0;
    },
    totalOrders() {
      return this.allOrders ? this.allOrders.length : 0;
    },
    chartData() {
      const labels = [];
      const data = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(date.toLocaleString("default", { month: "short" }));
        data.push(this.ordersByMonth(date.getFullYear(), date.getMonth()));
      }
      return {
        labels,
        datasets: [
          {
            label: "Orders",
            backgroundColor: "#42A5F5",
            data,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 30,
          },
        },
      };
    },
  },
  methods: {
    ordersByMonth(year, month) {
      return this.allOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === year && orderDate.getMonth() === month;
      }).length;
    },
  },
};
</script>

<style scoped>
.dashboard {
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
  justify-content: center;
}
.info-card-content h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}
.info-card-content p {
  margin: 0;
  font-size: 1.2rem;
}
</style>
