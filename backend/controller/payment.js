const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");
const { priceCart } = require("../utils/pricing");
const { getStripe } = require("../utils/paymentVerify");
const Order = require("../model/order");

// Creates a PaymentIntent for the amount the SERVER calculated from the cart (never the browser's number).
router.post(
  "/process",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const priced = await priceCart(req.body.cart, req.body.couponCode);
    const intent = await getStripe().paymentIntents.create({
      amount: Math.round(priced.grandTotal * 100),
      currency: process.env.CURRENCY || "usd",
      payment_method_types: ["card"],
      metadata: { userId: String(req.user.id), app: "Stallio" },
    });
    res.status(200).json({ success: true, client_secret: intent.client_secret, amount: priced.grandTotal });
  })
);

router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

// Stripe webhook (mounted in app.js with a raw body parser). Keeps stored payment status in sync with Stripe.
const stripeWebhook = async (req, res) => {
  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature check failed: ${err.message}`);
  }
  try {
    const obj = event.data.object;
    if (event.type === "payment_intent.succeeded") await Order.updateMany({ "paymentInfo.id": obj.id }, { "paymentInfo.status": "succeeded" });
    if (event.type === "payment_intent.payment_failed") await Order.updateMany({ "paymentInfo.id": obj.id }, { "paymentInfo.status": "failed" });
    if (event.type === "charge.refunded") await Order.updateMany({ "paymentInfo.id": obj.payment_intent }, { "paymentInfo.status": "refunded" });
    res.json({ received: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = router;
module.exports.stripeWebhook = stripeWebhook;
