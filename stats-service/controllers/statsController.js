const Order = require("../models/orderModel");

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

module.exports = {
  getStatistics,
};
