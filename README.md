# Stallio

A multi-vendor marketplace: buyers fill one cart from many independent shops, sellers run their own dashboard, and an admin oversees everything.

Based on the open-source [Eshop-tutorial](https://github.com/shahriarsajeeb/Eshop-tutorial) by Shahriar Sajeeb / Becodemy (copyright 2023; the upstream repo has no LICENSE file and its package.json says ISC). Keep this attribution, and check with the author before any commercial redistribution.

## What it does
Buyer, seller and admin roles · email-activated accounts · products, events and coupons · cart, wishlist, checkout · Stripe, PayPal and cash on delivery · order lifecycle with refunds · reviews · buyer-seller chat (Socket.io) · seller dashboard, withdrawals · admin panel.

## What changed from the reference project
| Area | Fix |
|---|---|
| Pricing | Server re-prices every cart from the database (price, stock, coupon, shipping). Browser totals are ignored. |
| Stripe | `/payment/process` needs login and uses the server total. `create-order` re-reads the PaymentIntent from Stripe and checks status, amount and owner. Webhook (`/api/v2/payment/webhook`) keeps payment status in sync. |
| PayPal | Order is verified server-side with PayPal's API before it is saved. |
| Multi-shop orders | Each shop's order stores its own total (reference stored the whole cart total on every shop's order, over-crediting sellers). |
| Seller balance | Credited with `+=` once (reference overwrote the balance, and could credit twice). |
| Card orders | Fixed a `paymnentInfo` typo that dropped payment details. |
| Order access | Sellers can only update their own shop's orders. |
| Stock | Replaced un-awaited `forEach(async)` with awaited loops. |
| Config | CORS, activation links, socket URL, API URL and PayPal client id come from env vars (reference hard-coded the author's domains). Committed `.env` files removed. |
| Hardening | `helmet`, rate limiting on login and signup routes, admin seed script. |
| Build | Fixed the reference frontend's invalid imports and migrated from Create React App to Vite. |
| Tooling | Tests, Dockerfiles, docker-compose, GitHub Actions CI. |

## Run locally
```bash
cp backend/.env.example backend/config/.env   # then fill in the keys
cp socket/.env.example socket/.env
cp frontend/.env.example frontend/.env
(cd backend && npm ci && npm run dev)
(cd socket && npm install && npm start)
(cd frontend && npm ci --legacy-peer-deps && npm start)
```
Create the first admin: `ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run seed:admin` (in `backend/`).
Stripe webhook locally: `stripe listen --forward-to localhost:8000/api/v2/payment/webhook`.
Everything at once: `docker compose up --build`.

## Deploy
Frontend on Vercel/Netlify, API on Render/Railway/Vercel, **socket service on an always-on host** (serverless cannot hold WebSockets), MongoDB Atlas. Set `CLIENT_URL` on the API and socket, and `VITE_*` variables on the frontend. Add the Stripe webhook endpoint in the Stripe dashboard.

## Known limits
PayPal verification and the webhook were written against the providers' documented APIs but could not be run against live accounts in the build environment. Test both with sandbox credentials before going live. Some third-party demo images from the reference UI are still hot-linked.
