# Deploy to Netlify (Static Frontend)

This guide shows you how to deploy the frontend to Netlify while keeping the backend on a separate service (Render/Railway).

## Architecture

- **Frontend (Netlify)**: Static React app
- **Backend (Render/Railway)**: Node.js server with WebSocket support

## Step 1: Deploy Backend First

The backend must be deployed first so you have the URL for environment variables.

### Deploy Backend to Render:

1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `PORT=10000`
     - `CLIENT_URL=https://your-netlify-app.netlify.app` (set after Netlify deploy)
5. Note your Render URL: `https://your-app.onrender.com`

## Step 2: Deploy Frontend to Netlify

### Option A: Deploy via Netlify Dashboard

1. **Go to Netlify**: https://app.netlify.com
2. **Sign up/Login** (free)
3. **Click "Add new site" → "Import an existing project"**
4. **Connect to Git** (GitHub/GitLab/Bitbucket)
5. **Select your repository**
6. **Configure build settings**:
   - **Base directory**: `client` (or leave empty if root)
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/build`
7. **Add Environment Variables** (Site settings → Environment variables):
   - `REACT_APP_API_URL` = `https://your-app.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://your-app.onrender.com`
8. **Deploy!**

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd client
npm run build
netlify deploy --prod --dir=build
```

## Step 3: Update Backend CORS

After Netlify deployment, update your backend's `CLIENT_URL` environment variable:

1. Go to Render dashboard
2. Environment tab
3. Update `CLIENT_URL` to your Netlify URL: `https://your-app.netlify.app`
4. Redeploy if needed

## Step 4: Test

1. Visit your Netlify URL
2. Create a room
3. Test multiplayer functionality
4. Verify WebSocket connections work

## Environment Variables Summary

### Netlify (Frontend):
- `REACT_APP_API_URL` = Your backend API URL
- `REACT_APP_SOCKET_URL` = Your backend WebSocket URL

### Render (Backend):
- `NODE_ENV` = `production`
- `PORT` = `10000` (or auto-set)
- `CLIENT_URL` = Your Netlify URL

## Troubleshooting

**CORS Errors?**
- Make sure `CLIENT_URL` in backend matches your Netlify URL exactly
- Check that CORS is configured in `server/index.js`

**WebSocket Not Connecting?**
- Verify `REACT_APP_SOCKET_URL` is set correctly in Netlify
- Check browser console for connection errors
- Ensure backend is running and accessible

**Build Fails?**
- Check Netlify build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18+) in Netlify settings

## Continuous Deployment

Once connected to Git:
- **Netlify** auto-deploys on every push to main branch
- **Render** can also auto-deploy from Git
- Both will rebuild automatically

## Cost

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)
- **Render**: Free tier (750 hours/month, sleeps after inactivity)

Both are free for small to medium traffic!

