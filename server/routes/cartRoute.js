const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/verifyJwt");
const { getCart, addToCart, updateCart, deleteFromCart } = require("../controllers/cartController");

router.get("/cart", verifyJwt(), getCart);
router.post("/cart", verifyJwt(), addToCart);
router.put("/cart", verifyJwt(), updateCart);
router.delete("/cart/:productId", verifyJwt(), deleteFromCart);

module.exports = router;
