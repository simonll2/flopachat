const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateThumbs,
} = require("../controllers/productController");
const verifyJwt = require("../middlewares/verifyJwt");
const verifyRole = require("../middlewares/verifyRole");
const setUploadFolder = require("../middlewares/setUploadFolder");

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", verifyJwt(), verifyRole(["admin"]), setUploadFolder, createProduct);
router.put("/products/:id", verifyJwt(), verifyRole(["admin"]), setUploadFolder, updateProduct);
router.delete("/products/:id", verifyJwt(), verifyRole(["admin"]), deleteProduct);
router.patch("/products/:id/thumbs", verifyJwt(), updateThumbs);

module.exports = router;
