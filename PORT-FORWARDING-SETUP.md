# 🌐 Port Forwarding Setup Guide

This guide helps you set up your AI Chatbot for public access using port forwarding tools like ngrok, localtunnel, or similar services.

## 🚀 Quick Setup

### Step 1: Port Forward Your Backend (Required)
First, you need to make your backend (port 5000) publicly accessible:

**Using ngrok:**
```bash
# Install ngrok if you haven't already
# Then run:
ngrok http 5000
```

**Using localtunnel:**
```bash
# Install localtunnel globally
npm install -g localtunnel

# Create tunnel for backend
lt --port 5000
```

You'll get a public URL like: `https://abc123.ngrok.io` or `https://xyz456.loca.lt`

### Step 2: Update Frontend Configuration
Use the provided script to update your frontend to use the public backend URL:

```bash
# Navigate to client directory
cd client

# Set your backend URL (replace with your actual URL)
npm run set-backend https://your-backend-url.com

# Or use the script directly
node set-backend-url.js https://your-backend-url.com
```

### Step 3: Restart Frontend
```bash
# Stop your current React server (Ctrl+C)
# Then restart it
npm start
```

### Step 4: Port Forward Your Frontend (Optional)
If you want a custom URL for your frontend too:

```bash
# In a new terminal, forward port 3001
ngrok http 3001
# or
lt --port 3001
```

## 🔧 Manual Configuration

If you prefer to manually edit the configuration:

1. **Edit `client/.env`:**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SERVER_URL=https://your-backend-url.com
```

2. **Restart your React development server**

## 🔄 Switch Back to Local Development

To switch back to local development:

```bash
cd client
npm run reset-local
# Then restart your React server
```

## 🛠️ Backend CORS Configuration

Your backend is already configured to accept requests from multiple origins. If you encounter CORS issues, the backend will automatically allow requests from:

- `http://localhost:3000`
- `http://localhost:3001` 
- `http://localhost:3002`
- Any URL set in `CLIENT_URL` environment variable

To add your public frontend URL to CORS, you can set an environment variable:

```bash
# In your backend terminal
set CLIENT_URL=https://your-frontend-url.com
# or on Linux/Mac:
export CLIENT_URL=https://your-frontend-url.com
```

## 📋 Test Accounts

Once set up, you can test with these accounts:

- **Admin**: `admin@chatbot.com` / `admin123`
- **User**: `user@chatbot.com` / `user123`

## 🐛 Troubleshooting

**Login not working?**
- Make sure your backend is publicly accessible
- Check that REACT_APP_API_URL points to your public backend URL
- Restart your React development server after changing environment variables

**CORS errors?**
- Ensure your backend CORS configuration includes your frontend URL
- Check that both frontend and backend are using HTTPS if one of them is

**API calls failing?**
- Verify your backend URL is correct and accessible
- Check browser developer tools for network errors
- Ensure your backend is running and responding to health checks

## 🎯 Example Complete Setup

1. **Start backend locally:**
   ```bash
   npm run dev
   ```

2. **Port forward backend:**
   ```bash
   ngrok http 5000
   # Get URL like: https://abc123.ngrok.io
   ```

3. **Update frontend:**
   ```bash
   cd client
   npm run set-backend https://abc123.ngrok.io
   ```

4. **Start frontend:**
   ```bash
   npm start
   # Access at: http://localhost:3001
   ```

5. **Optional - Port forward frontend:**
   ```bash
   ngrok http 3001
   # Get URL like: https://def456.ngrok.io
   ```

Now your chatbot is accessible publicly! 🎉
