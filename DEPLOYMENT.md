# Deployment Guide for PFMO Web App

## Quick Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code
1. Make sure all code is committed to GitHub
2. Ensure `package.json` has build script: `"build": "vite build"`
3. Check `vercel.json` exists in web_app folder

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up (use GitHub)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web_app`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://pfmo-backend.onrender.com`)
6. Click "Deploy"

### Step 3: Update API URL
After deployment, update `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-backend-url.onrender.com/api/$1"
    }
  ]
}
```

### Step 4: Test
Visit your Vercel URL (e.g., `https://pfmo-app.vercel.app`)
You should see the login page.

---

## Alternative: Deploy to Netlify

### Step 1: Prepare
Create `netlify.toml` in web_app folder:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.onrender.com/api/:splat"
  status = 200
  force = true
```

### Step 2: Deploy
1. Go to [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Connect GitHub and select repository
4. Configure:
   - Base directory: `web_app`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variable:
   - `VITE_API_URL`: Your backend URL
6. Deploy

---

## Environment Variables

### Required
- `VITE_API_URL`: Your backend API URL
  - Example: `https://pfmo-backend.onrender.com`
  - No trailing slash

### Optional
- `VITE_APP_NAME`: Application name (default: "PFMO Admin")

---

## Update API Service

After deployment, update `web_app/src/services/api_service.js` (if you have one) or ensure all API calls use the environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## Troubleshooting

### Build Fails
- Check Node version (should be 16+)
- Verify all dependencies in package.json
- Check build logs in Vercel/Netlify dashboard

### API Calls Fail
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running and accessible

### 404 Errors
- Check `vercel.json` or `netlify.toml` redirects
- Verify output directory is `dist`

---

## Production Checklist

- [ ] Environment variable `VITE_API_URL` set
- [ ] Build succeeds without errors
- [ ] Login page loads correctly
- [ ] API calls work (check browser console)
- [ ] Dark mode works
- [ ] All pages accessible
- [ ] Mobile responsive

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS as instructed



