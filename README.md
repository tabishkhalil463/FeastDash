# FeastDash - Online Food Ordering & Delivery Platform

A full-stack food ordering and delivery platform built for Pakistan, featuring multi-role user management, real-time order tracking, restaurant management, and an admin dashboard with analytics.

**Live Demo:** [https://feastdash.vercel.app](https://feastdash.vercel.app)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | ahmed@test.com | test1234 |
| Restaurant Owner | bilal@test.com | test1234 |
| Delivery Driver | kamran@test.com | test1234 |
| Admin | admin@feastdash.pk | test1234 |

---

## Features

- **Multi-Role Authentication** — Separate dashboards and permissions for customers, restaurant owners, delivery drivers, and admins with JWT-based auth (login, register, logout, password change)
- **Restaurant Management** — Restaurant owners can create and manage their restaurant profiles, set delivery fees, minimum orders, opening/closing hours, and cuisine types
- **Menu Management** — Full CRUD for menu categories and items with support for images, pricing, discounted prices, vegetarian/spicy tags, and preparation time
- **Cart & Checkout System** — Add to cart, quantity management, delivery fee calculation, tax computation, and multiple payment methods (COD, JazzCash, EasyPaisa, Card)
- **Order Tracking** — Real-time order status flow: Pending → Confirmed → Preparing → Ready → Picked Up → Delivered, with driver assignment
- **Delivery Driver Dashboard** — Drivers can view available orders, accept deliveries, and update delivery status
- **Reviews & Ratings** — Customers can rate and review restaurants after order delivery, with average rating calculations
- **Full-Text Search** — Search restaurants by name, cuisine type, or city with Django filters
- **Admin Dashboard** — Analytics with charts (Recharts) showing order trends, revenue, user stats, and restaurant performance
- **API Documentation** — Auto-generated Swagger/OpenAPI docs via drf-spectacular at `/api/docs/`
- **Responsive Design** — Mobile-first UI with a premium dark navy/purple theme and smooth animations
- **Cloud Image Storage** — Cloudinary integration for persistent media uploads in production
- **PKR Currency Support** — All prices formatted in Pakistani Rupees

---

## Tech Stack

### Backend
- **Python 3.12** — Core programming language
- **Django 5.1** — Web framework
- **Django REST Framework** — RESTful API development
- **PostgreSQL** — Primary database (Neon for production)
- **SimpleJWT** — JWT authentication with token blacklisting
- **drf-spectacular** — OpenAPI/Swagger documentation
- **django-filter** — Advanced filtering and search
- **Cloudinary** — Cloud-based media storage
- **Gunicorn** — Production WSGI server
- **WhiteNoise** — Static file serving

### Frontend
- **React 19** — UI library
- **Vite 7** — Build tool and dev server
- **Tailwind CSS 4** — Utility-first CSS framework
- **React Router 7** — Client-side routing
- **Axios** — HTTP client with interceptors for JWT refresh
- **Recharts** — Charts and data visualization for admin dashboard
- **React Hot Toast** — Toast notifications
- **React Icons** — Icon library
- **Headless UI** — Accessible UI components

### Deployment & Infrastructure
- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **Neon** — Serverless PostgreSQL database
- **Cloudinary** — Image/media CDN and storage

---

## Project Structure

```
FeastDash/
├── backend/
│   ├── accounts/          # User auth, profiles, admin management
│   ├── restaurants/       # Restaurant CRUD and categories
│   ├── menu/              # Menu categories and items
│   ├── orders/            # Order processing and tracking
│   ├── payments/          # Payment service
│   ├── reviews/           # Rating and review system
│   └── core/              # Django settings, URLs, WSGI
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── context/       # React Context (Auth, Cart)
│   │   ├── pages/         # All page components by role
│   │   ├── services/      # API service layer (Axios)
│   │   └── utils/         # Utilities (currency formatter, etc.)
│   └── public/
└── render.yaml            # Render deployment config
```

---

## Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit with your DB credentials
python manage.py migrate
python manage.py seed_data      # Load demo data
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend API at `http://localhost:8000/api/`.
