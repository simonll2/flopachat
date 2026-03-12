const Order = require("../models/orderModel");

// GET /stats — Totaux globaux (commandes livrées)
const getStatistics = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalSales: { $sum: "$total" } } },
    ]);

    const totalOrders = await Order.countDocuments({ status: "delivered" });

    res.json({ totalSales: totalSales[0]?.totalSales || 0, totalOrders });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /stats/summary — Résumé enrichi avec répartition par statut
const getSummary = async (req, res) => {
  try {
    const [salesAgg, statusAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: "delivered" } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
    ]);

    const totalSales = salesAgg[0]?.totalSales || 0;
    const totalOrders = salesAgg[0]?.totalOrders || 0;
    const averageCart = totalOrders > 0 ? Math.round((totalSales / totalOrders) * 100) / 100 : 0;
    const totalAllOrders = await Order.countDocuments();

    const ordersByStatus = {};
    statusAgg.forEach(({ status, count }) => {
      ordersByStatus[status] = count;
    });

    res.json({
      totalSales,
      totalOrders,
      totalAllOrders,
      averageCart,
      ordersByStatus,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /stats/monthly — CA et commandes par mois (12 derniers mois)
const getMonthlyStats = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthly = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: 1,
          orders: 1,
        },
      },
    ]);

    res.json(monthly);
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /stats/top-products — Top 5 produits les plus vendus
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$productInfo.name",
          imagePath: "$productInfo.imagePath",
          totalQuantity: 1,
          orderCount: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getStatistics,
  getSummary,
  getMonthlyStats,
  getTopProducts,
};
