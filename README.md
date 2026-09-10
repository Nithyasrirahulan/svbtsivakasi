# Srivari Balaji Traders — Website

A GitHub Pages frontend + Vercel serverless backend for Srivari Balaji Traders.

## Source price lists
- Multi Final Print 2026.xlsx
- Std Final Print 2026.xlsx

The generated catalogue contains **243 products**.

## Important pricing rule
The website uses the **"Less 50% Rate"** column from the supplied 2026 spreadsheets as the selling/offer price. It does not show MRP/list price or calculate a new discount.

For Gift Box rows where List Price is blank, the supplied rate is used directly.

## Project structure
- `frontend/` — static website for GitHub Pages
- `api/orders.js` — Vercel serverless order endpoint
- `frontend/data/products.json` — official product/price catalogue
- `frontend/js/products.js` — same catalogue bundled for fast static loading

## 1. Test locally
You can open `frontend/index.html` directly for the catalogue. Checkout requires the deployed Vercel API.

## 2. Deploy backend to Vercel
Create a Vercel project from this repository.

Set these environment variables:
- `RESEND_API_KEY` = your Resend API key
- `ORDER_EMAIL` = `svbtsivakasi@gmail.com`
- `FROM_EMAIL` = a verified sender, e.g. `Srivari Balaji Traders <orders@your-domain.com>`
- `FRONTEND_ORIGIN` = your GitHub Pages origin, e.g. `https://YOUR-USERNAME.github.io`

Install dependency:
`npm install`

## 3. Deploy frontend to GitHub Pages
Publish the `frontend` folder as the GitHub Pages site.

Because GitHub Pages is static, the Vercel API handles order email sending.

## 4. Connect checkout to Vercel
Open `frontend/js/checkout.js` and replace:
`https://YOUR-VERCEL-PROJECT.vercel.app/api/orders`
with your actual Vercel endpoint.

## 5. Resend
Create a Resend account/API key and verify a sending domain if required by Resend. Never put the Resend API key in frontend JavaScript or commit it to GitHub.

## 6. Order flow
Customer → GitHub Pages → Vercel `/api/orders` → Resend → `svbtsivakasi@gmail.com`

The browser sends only product IDs and quantities. The backend looks up the official price from `products.json` and recalculates totals before sending the email.

## Business details
Srivari Balaji Traders
3/299F Sivakasi Virudhunagar Main Road, Melammathur, Sivakasi 626130
Phone: 92451 44330 / 86108 92327 / 93639 44330
Email: svbtsivakasi@gmail.com
