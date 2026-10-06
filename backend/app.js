const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000").split(",").map((s) => s.trim());
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Stripe verifies webhook signatures against the RAW body, so register this before express.json()
app.post("/api/v2/payment/webhook", express.raw({ type: "application/json" }), require("./controller/payment").stripeWebhook);

app.use(express.json({ limit: "50mb" }));

// slow down brute-force attempts on auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.use(
  ["/api/v2/user/login-user", "/api/v2/shop/login-shop", "/api/v2/user/create-user", "/api/v2/shop/create-shop"],
  authLimiter
);
app.use(cookieParser());
app.use("/test", (req, res) => {
  res.send("Hello world!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/message");
const withdraw = require("./controller/withdraw");

app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
