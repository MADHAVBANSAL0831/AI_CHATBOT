# 🚀 Deployment Guide - Render + Vercel

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 1.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository: `MADHAVBANSAL0831/AI_CHATBOT`
3. Configure service:
   - **Name**: `ai-chatbot-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 1.3 Set Environment Variables in Render
Add these environment variables in Render dashboard (use your actual values):

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
CLIENT_URL=https://your-frontend-url.vercel.app
ENCRYPTION_KEY=your-32-character-encryption-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your-session-secret
WEBHOOK_SECRET=your-webhook-secret
```

### 1.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://ai-chatbot-backend.onrender.com`

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account

### 2.2 Import Project
1. Click "New Project"
2. Import from GitHub: `MADHAVBANSAL0831/AI_CHATBOT`
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables in Vercel
Add these in Vercel project settings:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_SERVER_URL=https://your-backend-url.onrender.com
REACT_APP_APP_NAME=Auto-Reply Chatbot
REACT_APP_VERSION=1.0.0
```

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

## Step 3: Update CORS Configuration

### 3.1 Update Backend Environment
1. Go back to Render dashboard
2. Update `CLIENT_URL` environment variable with your actual Vercel URL
3. Redeploy the backend service

## Step 4: Test Your Deployment

### 4.1 Test Accounts
- **Admin**: `admin@chatbot.com` / `admin123`
- **User**: `user@chatbot.com` / `user123`

### 4.2 Test URLs
- **Frontend**: https://your-app.vercel.app
- **Backend Health**: https://your-backend.onrender.com/api/health

## 🎯 Final Result

Your AI Chatbot will be live at your Vercel URL with:
- **Features**: Authentication, French AI responses, Real-time chat
- **Ready to share with clients!** 🎉

## 🐛 Troubleshooting

**Build Errors?**
- Check environment variables are set correctly
- Ensure all dependencies are in package.json

**CORS Errors?**
- Verify CLIENT_URL matches your Vercel URL exactly
- Redeploy backend after updating CLIENT_URL

**Database Connection Issues?**
- Verify MongoDB URI is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

**API Not Working?**
- Check backend logs in Render dashboard
- Verify GROQ_API_KEY is valid
- Test backend health endpoint

## 📋 Environment Variables Reference

Copy your actual values from your local `.env` file to the respective platforms:
- **Render**: Backend environment variables
- **Vercel**: Frontend environment variables (REACT_APP_* only)
