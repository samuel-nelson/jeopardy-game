# Deployment Guide

This guide will help you deploy the Jeopardy game to a free hosting platform.

## Quick Deploy to Render (Recommended)

### Step 1: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   cd /Users/admin/Desktop/Jep
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it (e.g., "jeopardy-game")
   - Don't initialize with README
   - Click "Create repository"

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Sign up/Login**:
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account if needed
   - Select your repository

3. **Configure Service**:
   - **Name**: jeopardy-game (or any name)
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Environment**: Node
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `cd server && npm start`

4. **Environment Variables** (click "Advanced"):
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render sets this automatically, but good to have)
   - `CLIENT_URL` = `https://your-app-name.onrender.com` (set this AFTER first deployment)

5. **Click "Create Web Service"**
   - Wait 5-10 minutes for first deployment
   - Your app will be live at `https://your-app-name.onrender.com`

6. **Update CLIENT_URL**:
   - After deployment, go to Environment tab
   - Update `CLIENT_URL` to your actual Render URL
   - Redeploy if needed

### Step 3: Test Your Deployment

1. Visit your Render URL
2. Create a room
3. Share the Room ID with friends
4. Test multiplayer functionality

---

## Alternative: Deploy to Railway

### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

### Step 2: Deploy
```bash
cd /Users/admin/Desktop/Jep
railway login
railway init
railway up
```

### Step 3: Set Environment Variables
In Railway dashboard:
- `NODE_ENV` = `production`
- `CLIENT_URL` = Your Railway URL

---

## Alternative: Deploy to Fly.io

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login and Deploy
```bash
fly auth login
fly launch
fly deploy
```

---

## Important Notes

### Free Tier Limitations:
- **Render**: Free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.
- **Railway**: $5 credit/month, usually enough for small apps
- **Fly.io**: 3 shared VMs, good for testing

### Production Checklist:
- ✅ Build command includes client build
- ✅ Start command runs server
- ✅ Environment variables set
- ✅ CORS configured for production URL
- ✅ Client build folder is served by server

### Troubleshooting:

**Build fails:**
- Check that all dependencies are in package.json
- Ensure Node.js version is compatible (18+)

**WebSocket not working:**
- Verify CLIENT_URL environment variable matches your deployed URL
- Check CORS settings in server/index.js

**App sleeps (Render):**
- Free tier apps sleep after inactivity
- First request after sleep takes time to wake up
- Consider upgrading for always-on service

---

## Local Testing Before Deployment

Test the production build locally:

```bash
# Build the client
npm run build

# Start the server (serves built client)
cd server && npm start
```

Visit http://localhost:5000 to test.

---

## Support

If you encounter issues:
1. Check Render/Railway logs in dashboard
2. Verify environment variables are set
3. Ensure all files are committed to git
4. Check that build completes successfully

