# Quick Start - Deploy to Render (Free)

Follow these simple steps to get your Jeopardy game live on the internet!

## Prerequisites
- GitHub account (free)
- Render account (free)

## Step-by-Step

### 1. Push to GitHub

```bash
cd /Users/admin/Desktop/Jep

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Jeopardy game - ready for deployment"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render

1. **Go to Render**: https://render.com
2. **Sign up** with GitHub (free)
3. **Click "New +"** → **"Web Service"**
4. **Connect** your GitHub repository
5. **Configure**:
   - **Name**: `jeopardy-game` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `cd server && npm start`
6. **Click "Create Web Service"**
7. **Wait 5-10 minutes** for deployment

### 3. Set Environment Variable

After deployment completes:

1. Go to your service → **Environment** tab
2. Add: `CLIENT_URL` = `https://your-app-name.onrender.com`
3. Save changes (auto-redeploys)

### 4. Done! 🎉

Your game is live at: `https://your-app-name.onrender.com`

Share the URL with friends to play together!

---

## Troubleshooting

**Build fails?**
- Check the logs in Render dashboard
- Make sure all files are committed to git

**WebSocket not working?**
- Verify `CLIENT_URL` environment variable is set correctly
- Make sure it matches your Render URL exactly

**App sleeps?**
- Free tier apps sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds
- This is normal for free tier

---

## Test Locally First

Before deploying, test the production build:

```bash
npm run build
cd server && npm start
```

Visit http://localhost:5000

