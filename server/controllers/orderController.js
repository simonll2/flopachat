// controllers/orderController.js
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const stripe = require("../lib/stripe");
const PaymentModel = require("../models/paymentModel");

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("products.product");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("products.product").populate("user");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const confirmOrder = async (req, res) => {
  const { sessionId } = req.body;
  try {
    // Rechercher la session de paiement
    let paymentSession = await PaymentModel.findOne({ sessionId });

    if (!paymentSession) {
      // Si la session n'existe pas, la créer
      paymentSession = new PaymentModel({ sessionId });
    } else if (paymentSession.processed) {
      // Si la session a déjà été traitée, retourner une erreur
      return res.status(400).json({ error: "Order has already been processed for this session." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    if (session.payment_status === "paid") {
      const products = session.line_items.data.map((item) => {
        const productId = item.price.product.metadata.productId;
        const quantity = item.quantity;
        const unitAmount = item.price.unit_amount;
        return {
          product: productId,
          quantity,
          unitAmount,
        };
      });

      const total = products.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0) / 100;

      const order = new Order({
        user: req.user._id,
        products: products.map(({ product, quantity }) => ({ product, quantity })), // ne stocke pas unitAmount dans l'ordre
        total,
        status: "completed",
      });

      await order.save();

      // Marquer la session de paiement comme traitée
      paymentSession.processed = true;
      await paymentSession.save();

      await Cart.deleteOne({ user: req.user._id });

      res.status(201).json(order);
    } else {
      res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "completed", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("products.product");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllOrders,
  getAllOrdersForAdmin,
  getOrderById,
  confirmOrder,
  updateOrderStatus,
};
