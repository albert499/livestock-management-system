# PastoralLink — Livestock Marketing and Management System (LMMS)

> A full-stack web application connecting pastoral farmers in Ghana with livestock buyers, with integrated health and productivity tracking.

**GitHub Repository:** https://github.com/albert499/livestock-management-system  
**Live Demo Video:** https://youtu.be/306H1ef3AAQ  
**Deployed Backend API:** https://livestock-management-system-ors5.onrender.com  
**Deployed Frontend:** https://pastorallink-frontend.onrender.com  
**Student:** Alberta Logozaga | BSc. Software Engineering | African Leadership University  
**Supervisor:** Elvira Khwatenge  

>  Note: The backend runs on Render's free tier and spins down after inactivity. If the deployed frontend shows empty listings, wait 60 seconds and refresh — the backend will wake up and data will load.

---

## Description

PastoralLink is a digital marketplace and livestock management tool built for pastoral farmers across Ghana's Upper East Region. It allows farmers to list livestock for sale, manage their inventory, log health and productivity records, track buyer inquiries, and access a regional market price index — without going through middlemen.

**Three Core Modules (as per project proposal):**
-  **Digital Marketplace** — browse, filter, and inquire about livestock directly from farmers
-  **Health & Productivity Tracking** — log health conditions, treatments, weight, milk yield, and offspring counts
-  **Livestock Record Management** — register animals, manage listings, track status (available/reserved/sold)

**Additional Features:**
-  Buyer inquiry system with direct farmer contact
-  Regional market price index
-  Fully responsive — works on mobile and desktop

**Tech Stack:** React 18 · Node.js · Express 4 · PostgreSQL (Supabase) · React Router v6 · Axios · Render.com

---

## How to Install and Run the App

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Git

### Step 1: Clone the repository
```bash
git clone https://github.com/albert499/livestock-management-system.git
cd livestock-management-system/final_project
```

### Step 2: Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```
DATABASE_URL=postgresql://postgres.sfbekibgegjqxmabnbcd:sdnKPFEqpbbqAZzm@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

Start the backend:
```bash
npm start
# API running at http://localhost:5000
```

### Step 3: Start the frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
# App opens at http://localhost:3000
```

> The React app proxies all `/api` requests to `http://localhost:5000` automatically.

---

## Project Structure

```
final_project/
├── backend/
│   ├── server.js        # Express app — 21 API endpoints across 6 modules
│   ├── db.js            # PostgreSQL schema (6 tables) + seed data via pg
│   ├── package.json     # Dependencies: express, pg, cors, uuid, dotenv
│   └── .env             # DATABASE_URL (create locally — not committed)
├── frontend/
│   └── src/
│       ├── App.js            # Router — 6 routes
│       ├── api.js            # Axios service layer — all 21 API calls
│       ├── components/
│       │   ├── Navbar.js     # Responsive navbar with mobile hamburger menu
│       │   └── LivestockCard.js
│       └── pages/
│           ├── Home.js              # Landing page with live stats + market prices
│           ├── Marketplace.js       # Filterable livestock listings
│           ├── AddListing.js        # Farmer registration + listing form
│           ├── Dashboard.js         # Stats, species breakdown, listing management
│           ├── HealthTracking.js    # Health + productivity records (NEW module)
│           └── LivestockDetail.js   # Animal detail + buyer inquiry form
└── README.md
```

---

## Database Schema (PostgreSQL via Supabase)

| Table | Key Fields |
|-------|-----------|
| `farmers` | id, name, phone (UNIQUE), location, region |
| `livestock` | id, farmer_id (FK), species, breed, age_months, weight_kg, price_ghs, quantity, status, location, region |
| `inquiries` | id, livestock_id (FK), buyer_name, buyer_phone, message, status |
| `market_prices` | id, species, region, avg_price |
| `health_records` | id, livestock_id (FK), record_date, condition, treatment, veterinarian, notes |
| `productivity_records` | id, livestock_id (FK), record_date, weight_kg, milk_yield_l, offspring_count, notes |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farmers` | List all registered farmers |
| GET | `/api/farmers/:id` | Get farmer + their listings |
| POST | `/api/farmers` | Register a new farmer |
| GET | `/api/livestock` | List livestock (filterable: species, region, price, status) |
| GET | `/api/livestock/:id` | Get single livestock detail |
| POST | `/api/livestock` | Create a new livestock listing |
| PATCH | `/api/livestock/:id` | Update status/price/quantity |
| DELETE | `/api/livestock/:id` | Remove a listing |
| POST | `/api/inquiries` | Submit buyer inquiry |
| GET | `/api/inquiries/livestock/:id` | Get inquiries for a listing |
| GET | `/api/market-prices` | Get current market prices by species/region |
| GET | `/api/stats` | Dashboard summary statistics |
| GET | `/api/health-records` | All health records (filterable by condition) |
| GET | `/api/health-records/:livestockId` | Health records for a specific animal |
| POST | `/api/health-records` | Add a health record |
| DELETE | `/api/health-records/:id` | Delete a health record |
| GET | `/api/productivity-records` | All productivity records |
| GET | `/api/productivity-records/:livestockId` | Productivity records for a specific animal |
| POST | `/api/productivity-records` | Add a productivity record |
| DELETE | `/api/productivity-records/:id` | Delete a productivity record |
| GET | `/api/health` | API health check |

---

## Testing Results — Screenshots with Relevant Demos

### Testing Strategy 1: Functional Testing — Desktop (Chrome & Edge)

**Home Page — Live stats showing 6 active listings and 3 registered farmers**

![Home Page Desktop](screenshots/home-desktop.png)

**Livestock Marketplace — 7 listings with species, region, and price filters**

![Marketplace Desktop](screenshots/marketplace-desktop.png)

**Livestock Detail Page — West African Dwarf Goat (GHS 420) with buyer inquiry form**

![Livestock Detail](screenshots/livestock-detail.png)

**Health & Productivity Tracking — 3 Healthy, 1 Sick, 1 Recovering, 5 Productivity Logs with full record table**

![Health Tracking Desktop](screenshots/health-desktop.png)

**Dashboard — 7 Active Listings, 5 Farmers, species breakdown bar chart, listing management tabs**

![Dashboard Desktop](screenshots/dashboard-desktop.png)

**Add Listing Form — farmer dropdown pre-populated, all fields, Create Listing button**

![Add Listing Desktop](screenshots/add-listing-desktop.png)

---

### Testing Strategy 2: Different Data Values

| Test | Input Data | Result |
|------|-----------|--------|
| Low price listing | GHS 85, poultry, 6 months | ✅ Displayed and formatted correctly |
| High price listing | GHS 6,200, Zebu bull, 4 years | ✅ Displayed and formatted correctly |
| Multiple species | Cattle, Goat, Sheep, Poultry | ✅ All accepted, icons match |
| Filter by species | Goat only | ✅ Only goat listings returned |
| Filter by region | Upper East only | ✅ Bolgatanga listings only |
| Health: Sick | Antibiotics 3-day, Dr. Issah | ✅ Red badge displayed |
| Health: Recovering | Continued monitoring | ✅ Yellow badge displayed |
| Health: Healthy | FMD Vaccine, Dr. Anane | ✅ Green badge displayed |
| Productivity: weight only | 265kg, no milk yield | ✅ Stored, milk shows as "—" |
| Productivity: full record | 35kg, 1.4L milk, 1 offspring | ✅ All fields stored correctly |
| Buyer inquiry | Name, phone, message | ✅ Stored and retrievable |
| Duplicate farmer phone | Same phone number twice | ✅ 409 Conflict returned |
| Missing required field | POST livestock without species | ✅ 400 Bad Request returned |

---

### Testing Strategy 3: Cross-Device / Hardware Performance

**Mobile View — Marketplace with 7 listings (Android phone browser)**

![Mobile Marketplace](screenshots/mobile-marketplace.png)

**Mobile View — Marketplace scrolling with filters**

![Mobile Marketplace Scroll](screenshots/mobile-marketplace-scroll.png)

**Mobile View — Health & Productivity Tracking on mobile**

![Mobile Health](screenshots/mobile-health.png)

**Mobile View — Dashboard with stats and species breakdown**

![Mobile Dashboard](screenshots/mobile-dashboard.png)

**Mobile View — Add Listing Form on mobile**

![Mobile Add Listing](screenshots/mobile-add-listing.png)

| Environment | Specification | Result |
|-------------|---------------|--------|
| Desktop Edge (Windows) | 1920×1080, Edge 124 | ✅ Full layout, all features functional |
| Desktop Chrome (Windows) | 1920×1080, Chrome 124 | ✅ Fully functional |
| Mobile Chrome (Android) | ~390px viewport | ✅ Responsive layout, hamburger menu works |
| Backend: Node.js v18 | v18.20.2 LTS | ✅ All endpoints respond correctly |
| Backend: Node.js v24 | v24.14.1 (Render) | ✅ Fully compatible |
| Database: PostgreSQL | v17.6 (Supabase) | ✅ All queries execute correctly |

---

## Analysis

### Achievement of Objectives

**Objective 1 — Literature review and needs assessment:** Fully achieved. A structured review across Google Scholar, Scopus, Web of Science, and ACM Digital Library identified the integration gap in existing pastoral digital tools. The needs assessment with pastoral farmers in Navrongo informed the three-module design.

**Objective 2 — System development (three-module web application):** Fully achieved. The LMMS delivers all three core modules as a responsive web application — livestock record management, health and productivity tracking, and a digital marketplace. The backend exposes 21 RESTful API endpoints across 6 PostgreSQL database tables. The frontend has 6 pages with full mobile responsiveness.

**Objective 3 — Prototype validation:** Functionally achieved. All three modules operate without critical errors across desktop (Chrome, Edge) and mobile (Android) browsers. The system handles multiple species, regions, health conditions, and data values as demonstrated in the testing results above. Formal SUS-scored pilot testing with pastoral farmers in Navrongo remains a next-phase evaluation activity.

### Gaps Identified

**Authentication:** The prototype does not implement user authentication. Any user can add or edit listings. This was a deliberate scope decision to reduce onboarding friction during prototype testing, but must be addressed before production deployment.

**Health and productivity module added post-initial development:** These modules were not in the initial prototype version. They were identified during review against the project proposal objectives and have been fully implemented, including 8 new API endpoints, 2 new database tables, and a complete HealthTracking frontend page.

**Offline functionality:** The system requires an active internet connection. PWA service worker caching for offline use is identified as a future development priority.

**Render free-tier cold start:** The backend spins down after 15 minutes of inactivity on the free tier, causing a ~50 second delay on first request. Users may see empty listings on initial load of the deployed version.

---

## Discussion

### Importance of Milestones

**Milestone 1 — Needs Assessment:** Farmer interviews in Navrongo directly shaped design priorities. Price transparency and direct buyer contact were identified as most urgent — this is why the marketplace module was prioritised first in the sprint sequence. The finding that farmers use basic Android smartphones on intermittent data connections shaped the decision to use React PWA techniques and compressed API responses.

**Milestone 2 — Backend API Development:** The decision to build a dedicated RESTful API rather than a monolithic application was pivotal. It enables the frontend to be replaced or extended — for example, with a Flutter mobile app for offline use — without changing the backend. The 21-endpoint API also provides a foundation for future integration with government livestock monitoring systems.

**Milestone 3 — Health and Productivity Tracking Module:** This module directly addresses the most critical management gap identified in the literature: pastoral farmers lack structured records to make evidence-based decisions. The health tracking module enables vaccination history, illness treatment logs, and condition monitoring to be recorded digitally — a first for this user group in the Upper East Region. The productivity records module allows weight progression and milk yield to be tracked over time, supporting better market timing decisions.

**Milestone 4 — Marketplace Integration:** The direct farmer-to-buyer marketplace is the primary mechanism for reducing intermediary dependence. Aker (2011) identifies information asymmetry as the most significant driver of income loss for pastoral farmers. By connecting farmers directly to a verified buyer pool with public phone contact, PastoralLink eliminates the information advantage that intermediaries exploit.

### Impact of Results

The PastoralLink prototype demonstrates that an integrated livestock management and marketplace platform can be built for and used by pastoral farming communities using widely available open-source technologies at near-zero infrastructure cost (PostgreSQL + Render free tier). This has direct replication value for development practitioners across Northern Ghana and comparable pastoral contexts in West Africa.

---

## Recommendations

### To the Pastoral Farming Community
1. **Start with the marketplace** — the quickest pathway to value is listing animals and receiving direct buyer inquiries
2. **Record health events immediately** — the system is designed for phone-based field entry; delayed entry risks losing important treatment information
3. **Use the market prices page before listing** — the regional price benchmarks help set competitive prices that reflect actual market conditions rather than intermediary-offered prices
4. **Encourage buyers to register** — the platform's value increases with buyer participation; urban buyers and institutional buyers represent higher-value markets

### To Future Developers
1. **Implement OTP authentication** — phone-number-based OTP (no email required) is the most accessible authentication mechanism for pastoral farmers
2. **Add PWA offline support** — service worker caching for livestock list and health record entry would allow data capture without mobile data
3. **Integrate MTN Mobile Money** — payment confirmation logging (not processing) would complete the transaction lifecycle within the platform
4. **Upgrade to paid PostgreSQL tier** — eliminates cold-start delays on the deployed version
5. **Conduct a full SUS-scored pilot** — structured usability testing with 20–30 pastoral farmers in Navrongo is the next formal research step

### Future Work
- Flutter mobile app for full offline functionality and Android APK distribution
- AI-assisted disease identification from symptoms entered in health records
- Livestock provenance QR code generation for buyer verification
- Integration with Ghana MoFA livestock registry for official record sharing
- Multilingual interface: Gurene, Buli, Twi

---

## Deployment Plan

| Component | Service | Status | URL |
|-----------|---------|--------|-----|
| Backend API | Render.com (Node.js Web Service) | ✅ Live | https://livestock-management-system-ors5.onrender.com |
| Frontend | Render.com (Static Site) | ✅ Live | https://pastorallink-frontend.onrender.com |
| Database | Supabase (PostgreSQL v17) | ✅ Live | sfbekibgegjqxmabnbcd.supabase.co |

**Build commands used:**
- Backend: `npm install` → `node server.js`
- Frontend: `npm install --legacy-peer-deps && chmod +x node_modules/.bin/react-scripts && node_modules/.bin/react-scripts build`

---

## Video Demo

**https://youtu.be/306H1ef3AAQ**

5-minute demonstration covering all core functionalities: marketplace browsing and filtering, livestock detail and buyer inquiry, health and productivity record management, dashboard statistics, and mobile responsiveness across devices.

---

## References

Aker, J. C. (2011). Dial "A" for agriculture: A review of ICT for agricultural extension in developing countries. *Agricultural Economics, 42*(6), 631–647.

Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human-Computer Interaction, 24*(6), 574–594.

IFAD. (2020). *Rural development report 2020*. International Fund for Agricultural Development.

Klerkx, L., Jakku, E., & Labarthe, P. (2019). A review of social science on digital agriculture and smart farming. *NJAS – Wageningen Journal of Life Sciences, 90–91*, 100315.

Nielsen, J. (1993). *Usability engineering*. Academic Press.

World Bank. (2022). *Agriculture and food overview*. https://www.worldbank.org
