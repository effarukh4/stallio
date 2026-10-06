const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const { priceCart } = require("../utils/pricing");
const { verifyStripePayment, verifyPaypalPayment } = require("../utils/paymentVerify");

// create new order(s): one per shop. Prices, coupon and payment are all verified on the server.
router.post(
  "/create-order",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { cart, shippingAddress, couponCode, paymentInfo } = req.body;
    if (!shippingAddress || !paymentInfo?.type) {
      return next(new ErrorHandler("Shipping address and payment method are required", 400));
    }
    const priced = await priceCart(cart, couponCode);

    let info;
    if (paymentInfo.type === "Credit Card") {
      info = await verifyStripePayment(paymentInfo.id, priced.grandTotal, req.user.id);
    } else if (paymentInfo.type === "Paypal") {
      info = await verifyPaypalPayment(paymentInfo.id, priced.grandTotal);
    } else if (paymentInfo.type === "Cash On Delivery") {
      info = { type: "Cash On Delivery", status: "Pending" };
    } else {
      return next(new ErrorHandler("Unsupported payment method", 400));
    }
    if (info.id && (await Order.exists({ "paymentInfo.id": info.id }))) {
      return next(new ErrorHandler("This payment was already used for an order", 409));
    }

    const user = req.user.toObject();
    const orders = [];
    for (const shop of priced.shops) {
      orders.push(
        await Order.create({ cart: shop.items, shippingAddress, user, totalPrice: shop.total, paymentInfo: info })
      );
    }
    res.status(201).json({ success: true, orders });
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (String(order.cart[0]?.shopId) !== String(req.seller._id)) {
        return next(new ErrorHandler("You can only update your own shop's orders", 403));
      }
      if (req.body.status === "Transferred to delivery partner") {
        for (const o of order.cart) {
          await updateOrder(o._id, o.qty);
        }
      }

      const alreadyDelivered = order.status === "Delivered";
      order.status = req.body.status;

      if (req.body.status === "Delivered" && !alreadyDelivered) {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock -= qty;
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);
        
        seller.availableBalance = (seller.availableBalance || 0) + amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (String(order.cart[0]?.shopId) !== String(req.seller._id)) {
        return next(new ErrorHandler("You can only update your own shop's orders", 403));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        for (const o of order.cart) {
          await updateOrder(o._id, o.qty);
        }
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
