const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/paymentController");
const verifyJwt = require("../middlewares/verifyJwt");

router.post("/create-checkout-session", verifyJwt(), createCheckoutSession);

module.exports = router;
