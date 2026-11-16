<div align="center">

# 📍 LocalLoop
### Hyperlocal Second-Hand Marketplace

An end-to-end, full-stack marketplace connecting nearby buyers and sellers within customizable neighborhood radii (1–50 km). Features real-time price negotiation, spatial search powered by PostGIS, dual-confirmation physical meetups, and secure online escrow via Razorpay.

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS_Spatial-green?style=for-the-badge)](https://postgis.net/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Key Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Quick Start](#-quick-start) •
[Demo Credentials](#-instant-demo-credentials) •
[Project Structure](#-project-structure) •
[API Reference](#-api-reference)

</div>

---

## 🌟 Overview

Traditional classifieds often suffer from ghosting, safety concerns, long shipping delays, and scam risks. **LocalLoop** transforms peer-to-peer commerce into a trusted neighborhood experience:

- **Hyperlocal Proximity**: Buyers find verified items within walking or short driving distance (1–50 km) using PostGIS spatial indexing or built-in Indian pincode resolution.
- **Dual-Mode Fulfillment**:
  - **🤝 Safe Physical Meetup**: Dual-confirmation handshake where both buyer and seller verify the physical handover before the order marks as complete.
  - **💳 Online Escrow**: Integrated Razorpay checkout with PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) preventing race conditions and double purchases.
- **In-App Real-Time Negotiation**: Make offers, send counteroffers, and chat seamlessly in real-time with Socket.IO.
- **Community Trust & Safety**: Verified purchase reviews, automatic seller rating calculations, listing flags, and a dedicated administrator moderation portal.

---

## 🚀 Key Features

### 🗺️ Hyperlocal & Spatial Discovery
- **PostGIS Engine**: Accurate proximity search with `ST_DWithin` and `ST_Distance` spherical geography.
- **Graceful Fallback**: Automatically falls back to high-precision Haversine mathematical queries if PostGIS is unavailable.
- **Interactive Map**: OpenStreetMap / Leaflet integration with dynamic distance badges and listing pins.
- **Postal Resolver**: Built-in Indian 6-digit Pincode resolver mapping postal codes to coordinates, localities, and cities.

### 💬 Real-Time Chat & Negotiation
- **Socket.IO Integration**: Instant messaging, live typing indicators, and read receipts.
- **Structured Offer State Machine**: `PENDING` ➔ `COUNTERED` ➔ `ACCEPTED` / `REJECTED` / `WITHDRAWN` directly inside chat threads.

### 🛡️ Dual-Fulfillment & Concurrency Protection
- **Meetup Mode**: Set meetup date, time, and public location. Dual-confirmation button required from both parties.
- **Online Checkout**: Razorpay test mode integration with cryptographic HMAC-SHA256 signature verification.
- **Strict Concurrency**: Row-level locking protects against simultaneous checkout attempts on single-inventory items.

### 👑 Moderation & Platform Administration
- **Admin Dashboard**: Real-time platform metrics (gross volume, active listings, dispute rates).
- **Listing Moderation**: Review reported listings, take down non-compliant items, or ban abusive accounts.
- **Role-Based Access**: Granular access control for `BUYER`, `SELLER`, and `ADMIN`.

---

## 🛠 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Zustand, React Router DOM v7, Axios |
| **Mapping** | Leaflet, React-Leaflet, OpenStreetMap |
| **Backend** | Node.js, Express, TypeScript, tsx, Zod, Helmet, CORS, Rate Limiting |
| **Database & Cache** | PostgreSQL 16, PostGIS 3.4, Redis 7 (Caching & Pub/Sub), node-postgres (`pg`) |
| **Real-Time** | Socket.IO |
| **Authentication** | JWT (Short-lived Access + Refresh Token Rotation), bcrypt |
| **Media & Storage** | Multer, Cloudinary (with automatic local disk fallback) |
| **Payments** | Razorpay Node SDK (Orders, Verification, Webhooks) |
| **DevOps & Containers** | Docker, Docker Compose, Multi-stage Dockerfiles |

---

## 👥 Instant Demo Credentials

The application includes pre-seeded demo accounts with rich listing histories, reviews, and test data:

| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Buyer** | `arjun.buyer@gmail.com` | `MarketPass123!` | Active chats, orders, saved wishlist items |
| **Seller** | `rahul.seller@gmail.com` | `MarketPass123!` | Active electronics listings in Indiranagar |
| **Seller** | `priya.tech@gmail.com` | `MarketPass123!` | Active listings in Koramangala, 4.9★ rating |
| **Admin** | `admin@localloop.market` | `MarketPass123!` | Access to the `/admin` moderation portal |

> 💡 **Quick Login**: The login page includes one-click instant demo login buttons to populate credentials automatically.

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Docker & Docker Compose](https://www.docker.com/) (recommended for PostGIS & Redis) *or* a local PostgreSQL installation.

---

### Method 1: Using Docker for Database (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/localloop-hyperlocal-marketplace.git
   cd localloop-hyperlocal-marketplace
   ```

2. **Install all dependencies (Monorepo root):**
   ```bash
   npm install
   ```

3. **Start PostgreSQL (with PostGIS) and Redis:**
   ```bash
   docker-compose up -d postgres redis
   ```
   *(PostgreSQL will listen on `localhost:5433` and Redis on `localhost:6379`)*

4. **Configure environment variables:**
   Copy the example environment file in `server/`:
   ```bash
   cp server/.env.example server/.env
   ```
   Ensure the database configuration matches Docker's port (`5433`):
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/localloop
   DB_HOST=127.0.0.1
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=localloop
   REDIS_URL=redis://localhost:6379
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   
   ```

5. **Run database migration and seed data:**
   ```bash
   npm --workspace=server run migrate
   npm --workspace=server run seed
   ```

6. **Start both backend and frontend:**
   ```bash
   # Terminal 1: Backend API (runs on http://localhost:5000)
   npm run dev:server

   # Terminal 2: Frontend Client (runs on http://localhost:3000)
   npm run dev:client
   ```

7. **Open your browser:**
   Navigate to **`http://localhost:3000`** and click **Demo Buyer** to log in!

---

### Method 2: Full Docker Deployment

To build and run the entire stack (Database, Redis, API Server, and Nginx-served Client) in Docker:

```bash
docker-compose up --build
```

Access the frontend at `http://localhost:3000` and the API at `http://localhost:5000/api/v1`.

---

## 📁 Project Structure

```text
├── client/                     # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # Reusable UI, Layout, Map & Product cards
│   │   ├── pages/              # Route pages (Home, Discovery, Chat, Admin, etc.)
│   │   ├── services/           # Axios instance & API client modules
│   │   ├── stores/             # Zustand state stores (auth, location, wishlist)
│   │   └── types/              # TypeScript definitions & schemas
│   ├── Dockerfile              # Multi-stage production build (Vite -> Nginx)
│   └── vite.config.ts          # Vite proxy configuration (/api -> :5000)
│
├── server/                     # Backend Application (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # DB pool, Redis, Cloudinary, Razorpay, Env config
│   │   ├── db/                 # SQL Schema definitions, migrations, and seeder
│   │   ├── middlewares/        # JWT Auth, RBAC, Validation, Error Handler, Multer
│   │   ├── modules/            # Domain modules (auth, listings, offers, orders, etc.)
│   │   ├── sockets/            # Socket.IO event listeners & chat handlers
│   │   ├── utils/              # Token helpers, Logger, Spatial calculators
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # HTTP & WebSocket server entrypoint
│   └── Dockerfile              # Production Node.js container build
│
├── docs/                       # Detailed documentation
│   └── api.md                  # REST API & WebSocket event specifications
├── DEVELOPMENT.md              # 10-Phase architecture tracking & progress checklist
└── docker-compose.yml          # Multi-container orchestration (PostGIS, Redis, App)
```

---

## 📡 API Reference

A detailed REST API & WebSocket specification is available in [`docs/api.md`](docs/api.md).

### Core Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new account | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT tokens | No |
| `POST` | `/api/v1/auth/refresh` | Rotate access and refresh tokens | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/v1/listings` | Spatial search with radius, category & price filters | No |
| `POST` | `/api/v1/listings` | Publish new product listing | Yes (Seller) |
| `POST` | `/api/v1/listings/upload` | Upload listing photos (Cloudinary/Local) | Yes |
| `GET` | `/api/v1/locations/pincode/:pincode` | Resolve Indian 6-digit postal code | No |
| `POST` | `/api/v1/offers` | Place price offer on listing | Yes |
| `PATCH` | `/api/v1/offers/:id/accept` | Accept negotiation offer | Yes |
| `POST` | `/api/v1/orders` | Create order (Online Escrow or Meetup) | Yes |
| `POST` | `/api/v1/orders/:id/confirm-meetup`| Dual-confirmation physical handshake | Yes |
| `GET` | `/api/v1/admin/metrics` | Platform KPIs and stats | Yes (Admin) |

---

## 🧪 Testing

To run the automated test suite (Vitest):

```bash
npm run test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

