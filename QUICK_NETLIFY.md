# Quick Netlify Deployment

## Prerequisites
- Backend deployed to Render (or Railway/Fly.io)
- GitHub repository with your code

## Steps

### 1. Deploy Backend First
Deploy the backend to Render (see DEPLOYMENT.md) and note the URL:
- Example: `https://jeopardy-backend.onrender.com`

### 2. Deploy Frontend to Netlify

**Via Netlify Dashboard:**

1. Go to https://app.netlify.com
2. Sign up/login (free)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Select your repository
6. **Configure build settings:**
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `build`
7. **Add Environment Variables** (Site settings → Environment):
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://your-backend.onrender.com`
8. Click "Deploy site"

### 3. Update Backend CORS

After Netlify deployment, update backend environment variable:
- In Render dashboard → Environment
- Set `CLIENT_URL` = `https://your-app.netlify.app`

### 4. Done! 🎉

Your app is live at: `https://your-app.netlify.app`

---

## Environment Variables Checklist

**Netlify (Frontend):**
- ✅ `REACT_APP_API_URL` = Backend URL + `/api`
- ✅ `REACT_APP_SOCKET_URL` = Backend URL

**Render (Backend):**
- ✅ `NODE_ENV` = `production`
- ✅ `CLIENT_URL` = Netlify URL

---

## Troubleshooting

**CORS errors?**
- Check `CLIENT_URL` in backend matches Netlify URL exactly
- No trailing slashes

**WebSocket not connecting?**
- Verify `REACT_APP_SOCKET_URL` is set in Netlify
- Check browser console for errors
- Ensure backend is running

**Build fails?**
- Check Netlify build logs
- Ensure Node.js 18+ is set in Netlify settings
- Verify all dependencies are in package.json

