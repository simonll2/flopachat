const stripe = require("../lib/stripe");
const Product = require("../models/productModel");

const createCheckoutSession = async (req, res) => {
  const { items } = req.body;

  const lineItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      return {
        price_data: {
          currency: "eur", // Change the currency to euros
          product_data: {
            name: product.name,
            description: product.description,
            metadata: {
              productId: product._id.toString(), // Add product ID to metadata
            },
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    })
  );

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CORS_ORIGIN || 'http://marketplace.local'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN || 'http://marketplace.local'}/cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createCheckoutSession };
