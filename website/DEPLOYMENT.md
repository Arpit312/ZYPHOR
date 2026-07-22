# 🚀 ZYPHOR Platform — Production Deployment Guide

This project is 100% production-ready for deployment via **Vercel** (Frontend & Serverless API) and **Docker / Docker Compose** (Containerized Server Deployment).

---

## 1. ⚡ Vercel Deployment (Recommended for Web)

### Step 1: Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import the `ZYPHOR` repository.
3. Select Framework Preset: **Next.js**.

### Step 2: Set Environment Variables in Vercel
Add the following Environment Variables in Vercel Project Settings:

| Key | Example / Description |
|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/zyphor` (MongoDB Atlas) |
| `JWT_SECRET` | Secret key for JWT session tokens |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `NEXT_PUBLIC_APP_NAME` | `ZYPHOR` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |

### Step 3: Deploy
Click **Deploy**. Vercel will automatically build using `vercel.json` and host your site with global edge CDN and automatic HTTPS!

---

## 2. 🐳 Docker Deployment (Containerized Server / VPS)

### Option A: Using Docker Compose (Web + MongoDB)
To run the full stack (Next.js app + MongoDB container) on any VPS (AWS, DigitalOcean, Hetzner, Linode):

```bash
# 1. Clone repository
git clone https://github.com/Arpit312/ZYPHOR.git
cd ZYPHOR/website

# 2. Build and start containers in background
docker compose up -d --build

# 3. Check container logs
docker compose logs -f
```
The application will be live at `http://localhost:3000` (or your server's IP address).

### Option B: Standalone Docker Image
```bash
# Build Docker image with standalone production bundle
docker build -t zyphor-web:latest .

# Run container
docker run -d -p 3000:3000 \
  -e MONGODB_URI="mongodb://your-mongo-ip:27017/zyphor" \
  -e JWT_SECRET="your_jwt_secret" \
  -e GEMINI_API_KEY="your_gemini_key" \
  zyphor-web:latest
```

---

## 🔒 Post-Deployment Checklist
- [x] All 25 device listings seeded with real GSMArena images
- [x] Verified working authentication (JWT HTTP-Only cookies + Bearer token)
- [x] Live MongoDB connection indicator with auto-retry pool
- [x] All 9 API test suites 100% passing
