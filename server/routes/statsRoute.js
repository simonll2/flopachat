const express = require("express");
const router = express.Router();
const verifyJwt = require("../middlewares/verifyJwt");
const verifyRole = require("../middlewares/verifyRole");
const { getStatistics } = require("../controllers/statsController");

router.get("/stats", verifyJwt(), verifyRole(["admin"]), getStatistics);

module.exports = router;
