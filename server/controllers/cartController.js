const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

    if (!cart) {
      // Si le panier n'existe plus, retourner un panier vide
      return res.json({ products: [], total: 0 });
    }

    // Filtrer les produits supprimés
    cart.products = cart.products.filter((p) => p.product !== null);

    // Recalculer le total du panier
    cart.total = cart.products.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, products: [], total: 0 });
    }

    const productIndex = cart.products.findIndex((p) => p.product.equals(productId));
    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    cart.total += product.price * quantity;
    product.stock -= quantity;

    await product.save();
    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex((p) => p.product.equals(productId));
    if (productIndex > -1) {
      const product = cart.products[productIndex].product;
      const difference = quantity - cart.products[productIndex].quantity;

      if (product.stock < difference) {
        return res.status(400).json({ error: "Not enough stock available" });
      }

      product.stock -= difference;
      cart.products[productIndex].quantity = quantity;
      cart.total = cart.products.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

      await product.save();
      await cart.save();

      res.json(cart);
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex((p) => p.product.equals(productId));
    if (productIndex > -1) {
      const product = cart.products[productIndex].product;
      product.stock += cart.products[productIndex].quantity;
      cart.total -= cart.products[productIndex].quantity * cart.products[productIndex].product.price;
      cart.products.splice(productIndex, 1);

      await product.save();
      await cart.save();

      res.json(cart);
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error deleting from cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  deleteFromCart,
};
