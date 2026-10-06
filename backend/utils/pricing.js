const ErrorHandler = require("./ErrorHandler");
const Product = require("../model/product");
const CouponCode = require("../model/coupounCode");

const SHIPPING_RATE = 0.1; // 10% of each shop's subtotal (same rule the checkout page shows)
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Pure function: items = [{ product, qty }], coupon = { shopId, value } | null
function computeTotals(items, coupon) {
  const shops = new Map();
  for (const { product, qty } of items) {
    const shopId = String(product.shopId);
    if (!shops.has(shopId)) shops.set(shopId, { shopId, items: [], subtotal: 0 });
    const shop = shops.get(shopId);
    shop.items.push({ ...product, qty });
    shop.subtotal += product.discountPrice * qty;
  }
  let grand = 0;
  const list = [];
  for (const shop of shops.values()) {
    const shipping = shop.subtotal * SHIPPING_RATE;
    const discount = coupon && String(coupon.shopId) === shop.shopId ? (shop.subtotal * coupon.value) / 100 : 0;
    const total = round2(shop.subtotal + shipping - discount);
    grand += total;
    list.push({ ...shop, subtotal: round2(shop.subtotal), shipping: round2(shipping), discount: round2(discount), total });
  }
  return { shops: list, grandTotal: round2(grand) };
}

// Looks up real prices/stock/coupon in the database. Never trusts prices sent by the browser.
async function priceCart(cart, couponName) {
  if (!Array.isArray(cart) || cart.length === 0) throw new ErrorHandler("Your cart is empty", 400);
  const wanted = new Map();
  for (const item of cart) {
    const qty = Number(item.qty);
    if (!item._id || !Number.isInteger(qty) || qty < 1) throw new ErrorHandler("Invalid cart item", 400);
    wanted.set(String(item._id), (wanted.get(String(item._id)) || 0) + qty);
  }
  const products = await Product.find({ _id: { $in: [...wanted.keys()] } });
  if (products.length !== wanted.size) throw new ErrorHandler("A product in your cart is no longer available", 400);
  const items = products.map((p) => {
    const qty = wanted.get(String(p._id));
    if (qty > p.stock) throw new ErrorHandler(`Only ${p.stock} of "${p.name}" left in stock`, 400);
    return { product: p.toObject(), qty };
  });
  let coupon = null;
  if (couponName) {
    coupon = await CouponCode.findOne({ name: couponName });
    if (!coupon) throw new ErrorHandler("Coupon code doesn't exist", 400);
    if (!items.some((i) => String(i.product.shopId) === String(coupon.shopId))) {
      throw new ErrorHandler("Coupon code is not valid for the shops in your cart", 400);
    }
  }
  return computeTotals(items, coupon);
}

module.exports = { priceCart, computeTotals, round2 };
