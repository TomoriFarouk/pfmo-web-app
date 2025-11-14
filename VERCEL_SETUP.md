# Vercel Setup Guide - Fix "Empty Logs" Issue

## Problem
If your Vercel frontend isn't calling the backend (empty logs), it's because the `VITE_API_URL` environment variable is not set.

## Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **pfmo-web-app** project

### Step 2: Add Environment Variable
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New**
4. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://pfmo-backend.onrender.com`
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
5. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

### Step 4: Verify
1. Open your Vercel app URL
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. You should see:
   ```
   🔗 API Base URL: https://pfmo-backend.onrender.com
   🔗 Environment: production
   🔗 VITE_API_URL env var: https://pfmo-backend.onrender.com
   ```
5. Try logging in
6. Check **Network** tab - you should see requests to `https://pfmo-backend.onrender.com/api/v1/auth/login`

## Important Notes

### ⚠️ Vite Environment Variables
- Vite only includes environment variables that start with `VITE_`
- Environment variables must be set **before** building
- After adding the variable, you **must redeploy** for it to take effect

### 🔍 Debugging
After setting the variable and redeploying, check the browser console:
- If you see `VITE_API_URL env var: NOT SET` → Variable not set correctly
- If you see `API Base URL: http://localhost:8000` → Variable not being used
- If you see `API Base URL: https://pfmo-backend.onrender.com` → ✅ Correct!

### 📝 Alternative: Update vercel.json
The `vercel.json` file has been updated with the backend URL as a fallback, but you should still set the environment variable for proper configuration.

## Still Not Working?

1. **Check Vercel Build Logs**
   - Go to your deployment
   - Click on the deployment
   - Check "Build Logs"
   - Look for any errors

2. **Check Browser Console**
   - Open DevTools (F12)
   - Console tab should show API URL
   - Network tab should show API requests

3. **Verify Backend is Running**
   - Visit: `https://pfmo-backend.onrender.com/health`
   - Should return: `{"status": "healthy", ...}`

4. **Check CORS**
   - In Render, set `BACKEND_CORS_ORIGINS` to include your Vercel URL
   - Format: `http://localhost:5173,https://your-app.vercel.app`

