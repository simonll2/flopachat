const Product = require("../models/productModel");
const User = require("../models/userModel");
const upload = require("../lib/multerConfig");
const path = require("path");
const fs = require("fs");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err });
    } else {
      try {
        const product = new Product({
          ...req.body,
          imagePath: req.file ? `/static/products/${req.file.filename}` : `/static/products/default-product.jpg`,
          thumbsUp: req.body.thumbsUp || 0,
          thumbsDown: req.body.thumbsDown || 0,
        });
        await product.save();
        return res.status(201).json(product);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  });
};

const updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err });
    }
    try {
      const productId = req.params.id;
      let updatedProductData = { ...req.body };

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (req.file) {
        updatedProductData.imagePath = `/static/products/${req.file.filename}`;
      } else if (!req.body.imagePath) {
        // Conserver l'image existante si elle n'est pas l'image par défaut
        if (product.imagePath !== "/static/products/default-product.jpg") {
          updatedProductData.imagePath = product.imagePath;
        } else {
          updatedProductData.imagePath = "/static/products/default-product.jpg";
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, {
        new: true,
      });

      return res.json(updatedProduct);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateThumbs = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbsUp, thumbsDown } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.votedProducts.includes(id)) {
      return res.status(400).json({ error: "User has already voted for this product" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Use $inc to increment server-side instead of accepting absolute values from client
    const update = {};
    if (thumbsUp !== undefined) update.thumbsUp = 1;
    if (thumbsDown !== undefined) update.thumbsDown = 1;

    const updatedProduct = await Product.findByIdAndUpdate(id, { $inc: update }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    user.votedProducts.push(id);
    await user.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating thumbs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateThumbs,
};
