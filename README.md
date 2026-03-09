# 🍽️ PlateShare

A food sharing platform where restaurants and donors post surplus food, and NGOs or recipients browse and request food to reduce waste.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |

---

## Project Structure

```
plateshare/
├── src/                        ← React frontend source
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── HeroPage.tsx
│   │   ├── LoginModal.tsx
│   │   ├── BrowseFood.tsx
│   │   ├── PostFood.tsx
│   │   ├── DonorDashboard.tsx
│   │   ├── NgoDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── api.ts                  ← API layer (connects to Express backend)
│   ├── types.ts                ← TypeScript interfaces
│   ├── App.tsx                 ← Root component and routing
│   ├── main.tsx                ← Entry point
│   └── index.css               ← Tailwind styles
│
├── backend/                    ← Express REST API
│   ├── server.js               ← API routes and middleware
│   ├── db.js                   ← MySQL connection pool
│   ├── package.json            ← Backend dependencies
│   └── .env                    ← Database config (edit before running)
│
├── database/                   ← MySQL schema and seed data
│   └── schema.sql              ← Tables, seed users, seed food listings
│
├── index.html                  ← Vite entry point
├── package.json                ← Frontend dependencies
├── vite.config.ts              ← Vite config
└── README.md                   ← This file
```

---

## Prerequisites

- **Node.js** v18+ → [https://nodejs.org](https://nodejs.org)
- **MySQL** v8.0+ → [https://dev.mysql.com/downloads](https://dev.mysql.com/downloads)

---

## Setup & Run

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

This creates the `plateshare_db` database with 3 tables and seed data.

Verify:

```bash
mysql -u root -p -e "USE plateshare_db; SHOW TABLES; SELECT user_id, full_name, role FROM users;"
```

### 2. Backend

```bash
cd backend
npm install
```

Edit `.env` with your MySQL password:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=plateshare_db
DB_PORT=3306
SERVER_PORT=5000
```

Start the server:

```bash
npm start
```

You should see:

```
✅ MySQL connected successfully to plateshare_db
🍽️  PlateShare API Server running on http://localhost:5000
```

### 3. Frontend

Open a new terminal:

```bash
# From project root (not backend/)
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Donor | donor@demo.com | password123 |
| NGO | ngo@demo.com | password123 |

---

## User Roles

**Admin** — View platform stats, manage users, approve NGOs, monitor donations

**Donor** — Post surplus food listings, edit/delete own listings, track donation history

**NGO/Recipient** — Browse available food, request/claim food, mark as collected

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/health | Health check |
| POST | /api/login | User login |
| POST | /api/users | Register new user |
| GET | /api/foods | Get all available food listings |
| POST | /api/foods | Create a food listing (donor) |
| PUT | /api/foods/:id | Update a food listing |
| DELETE | /api/foods/:id | Delete a food listing |
| GET | /api/users/:id/listings | Get donor's own listings |
| POST | /api/claims | Claim a food listing (NGO) |
| GET | /api/users/:id/claims | Get NGO's claims |
| PUT | /api/claims/:id/collect | Mark claim as collected |
| GET | /api/admin/users | Get all users |
| PUT | /api/admin/users/:id/toggle | Activate/deactivate user |
| PUT | /api/admin/users/:id/approve | Approve pending user |
| GET | /api/admin/stats | Platform statistics |
| GET | /api/admin/donations | All donation records |
| GET | /api/admin/pending | Pending approvals |
| GET | /api/stats | Public stats for landing page |
| GET | /api/cities | List of all cities |
| GET | /api/food-types | List of food types |

---

## Database Schema

### users
| Column | Type |
|--------|------|
| user_id | INT AUTO_INCREMENT PRIMARY KEY |
| full_name | VARCHAR(100) |
| email | VARCHAR(100) UNIQUE |
| password_hash | VARCHAR(255) |
| phone | VARCHAR(20) |
| role | ENUM('admin','donor','recipient') |
| org_name | VARCHAR(150) |
| address | TEXT |
| city | VARCHAR(100) |
| is_approved | BOOLEAN DEFAULT FALSE |
| is_active | BOOLEAN DEFAULT TRUE |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

### food_listings
| Column | Type |
|--------|------|
| food_id | INT AUTO_INCREMENT PRIMARY KEY |
| title | VARCHAR(200) |
| description | TEXT |
| quantity | VARCHAR(100) |
| food_type | VARCHAR(50) |
| pickup_address | TEXT |
| city | VARCHAR(100) |
| expiry_time | DATETIME |
| donor_id | INT (FK → users) |
| status | ENUM('available','requested','completed') |
| created_at | TIMESTAMP |

### claims
| Column | Type |
|--------|------|
| claim_id | INT AUTO_INCREMENT PRIMARY KEY |
| food_id | INT (FK → food_listings) |
| user_id | INT (FK → users) |
| status | ENUM('reserved','collected') |
| created_at | TIMESTAMP |

---

## Quick Test Flow

1. **Login as Donor** → Post a food listing → See it in My Listings
2. **Login as NGO** → Browse food → Request it → Go to My Claims → Mark as Collected
3. **Login as Admin** → Check Overview → Meals Rescued count is updated

---

## Notes

- The frontend auto-detects whether the backend is running. If not, it falls back to localStorage so the app still works standalone.
- All passwords in seed data are bcrypt hashes of `password123`.
- The backend runs on port 5000 by default (configurable in `.env`).
- The frontend dev server runs on port 5173 by default.
