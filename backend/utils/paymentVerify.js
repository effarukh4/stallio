const ErrorHandler = require("./ErrorHandler");

let stripeClient;
const getStripe = () => (stripeClient = stripeClient || require("stripe")(process.env.STRIPE_SECRET_KEY));

// Re-reads the PaymentIntent from Stripe so a forged "payment succeeded" request cannot create an order.
async function verifyStripePayment(paymentIntentId, expectedTotal, userId) {
  if (!paymentIntentId) throw new ErrorHandler("Missing payment reference", 400);
  const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded") throw new ErrorHandler("Payment has not succeeded", 402);
  if (pi.amount !== Math.round(expectedTotal * 100)) throw new ErrorHandler("Paid amount does not match the order total", 400);
  if (pi.metadata?.userId !== String(userId)) throw new ErrorHandler("This payment belongs to another account", 403);
  return { id: pi.id, status: "succeeded", type: "Credit Card" };
}

// Asks PayPal directly whether the order was captured and for how much.
async function verifyPaypalPayment(orderId, expectedTotal) {
  const { PAYPAL_CLIENT_ID: id, PAYPAL_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new ErrorHandler("PayPal is not configured on the server", 501);
  if (!orderId) throw new ErrorHandler("Missing payment reference", 400);
  const base = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) throw new ErrorHandler("Could not reach PayPal", 502);
  const { access_token } = await tokenRes.json();
  const res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!res.ok) throw new ErrorHandler("PayPal order not found", 400);
  const order = await res.json();
  const unit = order.purchase_units?.[0];
  if (order.status !== "COMPLETED") throw new ErrorHandler("PayPal payment is not completed", 402);
  // the PayPal order is created in the browser, so allow 2 cents of rounding difference only
  if (unit?.amount?.currency_code !== "USD" || Math.abs(Number(unit.amount.value) - expectedTotal) > 0.02) {
    throw new ErrorHandler("Paid amount does not match the order total", 400);
  }
  return { id: order.id, status: "succeeded", type: "Paypal" };
}

module.exports = { getStripe, verifyStripePayment, verifyPaypalPayment };
