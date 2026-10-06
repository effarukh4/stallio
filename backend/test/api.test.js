process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_dummy";
const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
mongoose.set("bufferTimeoutMS", 50);
const app = require("../app");

let server, base;
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
test.after(() => server.close());

const apiMounts = [
  "/api/v2/user",
  "/api/v2/conversation",
  "/api/v2/message",
  "/api/v2/order",
  "/api/v2/shop",
  "/api/v2/product",
  "/api/v2/event",
  "/api/v2/coupon",
  "/api/v2/payment",
  "/api/v2/withdraw",
];

const protectedRoutes = new Set([
  "GET /api/v2/user/getuser",
  "PUT /api/v2/user/update-user-info",
  "PUT /api/v2/user/update-avatar",
  "PUT /api/v2/user/update-user-addresses",
  "DELETE /api/v2/user/delete-user-address/:id",
  "PUT /api/v2/user/update-user-password",
  "GET /api/v2/user/admin-all-users",
  "DELETE /api/v2/user/delete-user/:id",
  "GET /api/v2/conversation/get-all-conversation-seller/:id",
  "GET /api/v2/conversation/get-all-conversation-user/:id",
  "POST /api/v2/order/create-order",
  "PUT /api/v2/order/update-order-status/:id",
  "PUT /api/v2/order/order-refund-success/:id",
  "GET /api/v2/order/admin-all-orders",
  "GET /api/v2/shop/getSeller",
  "PUT /api/v2/shop/update-shop-avatar",
  "PUT /api/v2/shop/update-seller-info",
  "GET /api/v2/shop/admin-all-sellers",
  "DELETE /api/v2/shop/delete-seller/:id",
  "PUT /api/v2/shop/update-payment-methods",
  "DELETE /api/v2/shop/delete-withdraw-method/",
  "DELETE /api/v2/product/delete-shop-product/:id",
  "PUT /api/v2/product/create-new-review",
  "GET /api/v2/product/admin-all-products",
  "GET /api/v2/event/admin-all-events",
  "POST /api/v2/coupon/create-coupon-code",
  "GET /api/v2/coupon/get-coupon/:id",
  "DELETE /api/v2/coupon/delete-coupon/:id",
  "POST /api/v2/payment/process",
  "POST /api/v2/withdraw/create-withdraw-request",
  "GET /api/v2/withdraw/get-all-withdraw-request",
  "PUT /api/v2/withdraw/update-withdraw-request/:id",
]);

const getRegisteredRoutes = () => {
  const routes = [];
  for (const layer of app._router.stack) {
    if (layer.name !== "router") continue;
    const mount = apiMounts.find((prefix) => layer.regexp.test(prefix));
    if (!mount) continue;

    for (const routeLayer of layer.handle.stack) {
      if (!routeLayer.route) continue;
      for (const method of Object.keys(routeLayer.route.methods)) {
        routes.push({
          method: method.toUpperCase(),
          path: `${mount}${routeLayer.route.path}`,
        });
      }
    }
  }
  return routes;
};

test("health route responds and security headers are set", async () => {
  const res = await fetch(`${base}/test`);
  assert.equal(res.status, 200);
  assert.ok(res.headers.get("x-content-type-options"));
});

test("every registered API route is reachable and enforces anonymous access", async () => {
  const routes = getRegisteredRoutes();
  assert.equal(routes.length, 58, "update the route sweep when API routes change");

  const failures = [];
  for (const route of routes) {
    const routeKey = `${route.method} ${route.path}`;
    const path = route.path.replace(/:[^/]+/g, "route-test");
    const options = { method: route.method };
    if (!["GET", "HEAD"].includes(route.method)) {
      options.headers = { "Content-Type": "application/json" };
      options.body = "{}";
    }

    try {
      const response = await fetch(`${base}${path}`, options);
      const contentType = response.headers.get("content-type") || "";

      if (protectedRoutes.has(routeKey) && response.status !== 401) {
        failures.push(`${routeKey}: expected 401 without credentials, got ${response.status}`);
      } else if (response.status === 404 && !contentType.includes("application/json")) {
        failures.push(`${routeKey}: Express route-not-found response`);
      }
    } catch (error) {
      failures.push(`${routeKey}: request failed (${error.message})`);
    }
  }

  assert.deepEqual(failures, []);
});

test("payment intent requires a logged-in user", async () => {
  const res = await fetch(`${base}/api/v2/payment/process`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(res.status, 401);
});

test("order creation requires a logged-in user", async () => {
  const res = await fetch(`${base}/api/v2/order/create-order`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(res.status, 401);
});

test("webhook rejects an invalid Stripe signature", async () => {
  const res = await fetch(`${base}/api/v2/payment/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "stripe-signature": "bad" }, body: "{}" });
  assert.equal(res.status, 400);
});
