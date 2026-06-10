#  PastoralLink — Livestock Marketing and Management System

> A full-stack web application connecting pastoral farmers in Ghana with livestock buyers.

**GitHub Repository:** https://github.com/albert499/livestock-management-system

---

## Description

PastoralLink is a digital marketplace and management tool built for pastoral farmers across Ghana. It allows farmers to list livestock for sale, manage their inventory, track inquiries from buyers, and access a regional market price index — all without going through middlemen.

**Problem it solves:**
- Farmers in rural Ghana (especially Northern, Upper East, Upper West regions) have limited market access and no visibility into fair prices
- Buyers have no central platform to browse quality livestock across regions
- There are no digital tools for farmers to manage their livestock records

**Core features:**
-  Marketplace — browse livestock filtered by species, region, and price
-  Add Listing — farmers register and list animals with full details
-  Dashboard — manage listings, view stats, mark animals as sold
-  Inquiries — buyers send direct contact requests to farmers
-  Market Prices — current average prices by species and region

**Tech Stack:** React 18 · Node.js · Express 4 · SQLite (better-sqlite3) · React Router v6 · Axios

---

## How to Set Up the Environment and Project

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Git

### 1. Clone the repository
```bash
git clone https://github.com/albert499/livestock-management-system.git
cd livestock-management-system
```

### 2. Start the backend
```bash
cd backend
npm install
npm start
# API running at http://localhost:5000
```

The database (`livestock.db`) is created automatically on first run and seeded with demo data.

### 3. Start the frontend
```bash
cd ../frontend
npm install
npm start
# App running at http://localhost:3000
```

Open your browser at **http://localhost:3000**

> The React app proxies all `/api` requests to `http://localhost:5000` automatically — no extra configuration needed.

---

## Designs

### UI Style Guide
| Token | Value | Usage |
|---|---|---|
| Primary colour | `#C1440E` (Terracotta) | Buttons, prices, accents |
| Background | `#FAF6EE` (Cream) | Page backgrounds |
| Dark | `#2C1810` (Soil) | Navbar, hero |
| Highlight | `#E8A020` (Amber) | Logo, active states |
| Green | `#4A7C59` (Savanna) | Add listing, success |
| Display font | Syne | Headings, prices |
| Body font | DM Sans | All body text |


**Key screens:**
- `/` — Landing page with live stats, species browser, market prices
- `/market` — Marketplace with filter sidebar and listings grid
- `/add` — Add listing form with farmer registration tab
- `/dashboard` — Stats, species breakdown chart, tabbed listings
- `/livestock/:id` — Animal detail page with buyer inquiry form

### GitHub
> github link: *(https://github.com/albert499/livestock-management-system.git)*

---

## Deployment Plan

| Component | Service | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy from `main` branch, CDN delivery |
| Backend API | Render.com | Node.js hosting, automatic HTTPS |
| Database | Supabase (PostgreSQL) | Migrate from SQLite for production concurrency |
| Image storage | Cloudinary | For livestock photo uploads (future feature) |

### Production environment variables

**Backend `.env`:**
```
PORT=5000
DATABASE_URL=postgres://...
NODE_ENV=production
```

**Frontend `.env`:**
```
REACT_APP_API_URL=https://pastorallink-api.onrender.com
```

### Build command
```bash
cd frontend && npm run build
```

---

## Video Demo

> **Link:** *(https://youtu.be/8u_lQdGImP0)*  
> Duration: 5–10 minutes demonstrating all app functionalities

---

## Project Structure

```
livestock-management-system/
├── backend/
│   ├── server.js       # Express app, all 13 API routes
│   ├── db.js           # SQLite schema + seed data
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js         # React entry point
│   │   ├── index.css        # Global styles + design tokens
│   │   ├── api.js           # Axios API service layer
│   │   ├── App.js           # Router configuration
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── LivestockCard.js
│   │   └── pages/
│   │       ├── Home.js
│   │       ├── Marketplace.js
│   │       ├── AddListing.js
│   │       ├── Dashboard.js
│   │       └── LivestockDetail.js
│   └── package.json
└── README.md
```

---
