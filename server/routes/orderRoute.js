const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/verifyJwt");
const verifyRole = require("../middlewares/verifyRole");
const { getAllOrders, getAllOrdersForAdmin, getOrderById, confirmOrder } = require("../controllers/orderController");

router.get("/orders", verifyJwt(), getAllOrders);
router.get("/admin/orders", verifyJwt(), verifyRole(["admin"]), getAllOrdersForAdmin); // Nouvelle route pour les admins
router.get("/orders/:id", verifyJwt(), getOrderById);
router.post("/orders/confirm", verifyJwt(), confirmOrder);

module.exports = router;
