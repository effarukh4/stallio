const test = require("node:test");
const assert = require("node:assert");
const { computeTotals } = require("../utils/pricing");

const p = (shopId, price) => ({ _id: shopId + price, shopId, discountPrice: price });

test("splits a multi-shop cart into per-shop totals that add up to the grand total", () => {
  const r = computeTotals([{ product: p("A", 100), qty: 2 }, { product: p("B", 50), qty: 1 }], null);
  assert.equal(r.shops.length, 2);
  assert.equal(r.shops.find((s) => s.shopId === "A").total, 220); // 200 + 10% shipping
  assert.equal(r.shops.find((s) => s.shopId === "B").total, 55);
  assert.equal(r.grandTotal, 275);
});

test("a coupon only discounts the shop that issued it", () => {
  const r = computeTotals([{ product: p("A", 100), qty: 1 }, { product: p("B", 100), qty: 1 }], { shopId: "A", value: 20 });
  assert.equal(r.shops.find((s) => s.shopId === "A").total, 90); // 100 + 10 - 20
  assert.equal(r.shops.find((s) => s.shopId === "B").total, 110);
});

test("rounds to cents", () => {
  const r = computeTotals([{ product: p("A", 19.99), qty: 3 }], null);
  assert.equal(r.grandTotal, 65.97);
});
