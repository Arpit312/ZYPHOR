# 🚀 ZYPHOR Deployment Guide (Frontend on Vercel + Backend on Render + Docker)

This repository is structured for seamless separation of Frontend (`/website`) and Backend (`/server`).

---

## 📁 Repository Structure
```
zyphor-platform/
├── website/             # Next.js 14 Frontend Application (Deploy to Vercel)
├── server/              # Express Node.js Backend API (Deploy to Render / Docker)
└── docker-compose.yml   # Multi-container orchestrator for local/VPS deployment
```

---

## 🌐 1. Deploying Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository (`ZYPHOR`).
3. Set **Root Directory** to `website`.
4. Configure Framework Preset as **Next.js**.
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://<your-render-backend-url>.onrender.com/api`
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `NEXTAUTH_SECRET`: `your_random_secret_key`
   - `NEXTAUTH_URL`: `https://your-vercel-app.vercel.app`
6. Click **Deploy**.

---

## ⚡ 2. Deploying Backend to Render
1. Go to [Render Dashboard](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository (`ZYPHOR`).
3. Set **Root Directory** to `server`.
4. Choose **Environment**: `Node` (or `Docker` using `server/Dockerfile`).
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_jwt_secret_key`
8. Click **Deploy Web Service**.

---

## 🐳 3. Deploying locally or to VPS with Docker
To run the entire stack (Frontend + Backend + MongoDB) locally or on a VPS:

```bash
# Clone the repository
git clone https://github.com/Arpit312/ZYPHOR.git
cd ZYPHOR

# Run with Docker Compose
docker-compose up --build -d
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/zyphor
