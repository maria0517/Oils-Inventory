# 🌿 Essential Oils Inventory Management System

A responsive, full-stack inventory management web application tailored for real-time tracking of essential oil stocks (5ml and 15ml bottles). Built with modern cloud and developer workflows in mind, featuring optimistic UI updates, bilingual lookup, validation constraints, and container-ready architecture.

---

## ✨ Features

- **⚡ Real-Time Stock Control**: Quick increment and decrement counters for both small (5ml) and large (15ml) bottles with instantaneous optimistic UI feedback.
- **🔍 Bilingual Search**: Live filtering matching both Romanian and English botanical/commercial names simultaneously.
- **➕ Safe Item Ingestion**:
  - Modal form for registering new oils.
  - Automatic fallback to `0` for empty quantity fields.
  - Duplicate check against database constraints (`@unique` index validation).
  - Visual pulse highlight (`✨ Adăugat recent`) and auto-scroll directly to newly added items.
- **🗑️ Guarded Deletion**: Custom styled confirmation modal preventing accidental deletions.
- **📱 Mobile-First Responsive Design**: Optimized interface using Tailwind CSS, suitable for mobile browsers and PWA home screen installs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (Modular Architecture)
- **Language**: TypeScript
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Validation**: Built-in NestJS validation & exception filters

### Database & Deployment Infrastructure
- **Database**: PostgreSQL (Cloud Hosted / Serverless)
- **Backend Runtime**: Node.js Web Service on Cloud Container runtime
- **Frontend Hosting**: Edge CDN Global Distribution

---

## 📁 Repository Structure

```text
Oils-Inventory/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema & relational models
│   │   └── seed.ts             # Initial seed script for inventory items
│   ├── src/
│   │   ├── oils/               # Oils module (controller, service, DTOs)
│   │   ├── prisma/             # Prisma service wrapper
│   │   ├── app.module.ts       # Main application module
│   │   └── main.ts             # Application bootstrap & CORS setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api.ts              # Typed REST client integration
│   │   ├── App.tsx             # Main application UI & state management
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.tsx            # React application mount
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database (local or remote instance)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/maria0517/Oils-Inventory.git
cd Oils-Inventory
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"
PORT=3000
```

Run database migrations and load initial data:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Start the backend API in watch mode:
```bash
npm run start:dev
```

The REST API will be running locally at `http://localhost:3000`.

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible at `http://localhost:5173`.
