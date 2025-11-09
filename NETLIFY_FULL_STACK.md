# Deploy Everything to Netlify

This guide shows you how to deploy the entire Jeopardy game to Netlify, including the "backend" using Netlify Functions and Pusher for real-time features.

## Architecture

- **Frontend**: Static React app (Netlify)
- **API**: Netlify Functions (serverless)
- **Real-time**: Pusher (WebSocket service with free tier)

## Prerequisites

1. Netlify account (free)
2. Pusher account (free tier available)
3. GitHub repository

## Step 1: Set Up Pusher

Pusher provides the WebSocket functionality that Netlify Functions can't handle directly.

1. **Sign up for Pusher**: https://pusher.com (free tier available)
2. **Create a new app**:
   - Go to Dashboard → Channels Apps → Create app
   - Choose a name (e.g., "Jeopardy Game")
   - Select cluster (e.g., `us2`)
   - Click "Create app"
3. **Get your credentials**:
   - App ID
   - Key
   - Secret
   - Cluster

## Step 2: Update Netlify Configuration

The `netlify.toml` is already configured. Make sure it looks like this:

```toml
[build]
  base = "client"
  publish = "build"
  command = "npm install && npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Step 3: Install Function Dependencies

Netlify Functions need their own `package.json`. We've created `netlify/functions/package.json` with Pusher dependency.

## Step 4: Update Client to Use Pusher

The client needs to use Pusher instead of Socket.io. We've created `pusherService.ts` but you need to:

1. **Update `client/src/pages/Game.tsx`** to use `pusherService` instead of `socketService`
2. **Update `client/src/pages/Lobby.tsx`** similarly

Or we can create a wrapper that switches between them based on environment.

## Step 5: Deploy to Netlify

1. **Push to GitHub** (if not already)
2. **Go to Netlify**: https://app.netlify.com
3. **Import project** from GitHub
4. **Configure build**:
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
5. **Set Environment Variables** (Site settings → Environment):
   - `REACT_APP_PUSHER_KEY` = Your Pusher Key
   - `REACT_APP_PUSHER_CLUSTER` = Your Pusher Cluster (e.g., `us2`)
   - `PUSHER_APP_ID` = Your Pusher App ID
   - `PUSHER_KEY` = Your Pusher Key
   - `PUSHER_SECRET` = Your Pusher Secret
   - `PUSHER_CLUSTER` = Your Pusher Cluster
6. **Deploy!**

## Step 6: Test

1. Visit your Netlify URL
2. Create a room
3. Test multiplayer functionality
4. Verify WebSocket connections work

## Environment Variables Summary

### Netlify Environment Variables:

**For Frontend (REACT_APP_*):**
- `REACT_APP_PUSHER_KEY` = Your Pusher Key
- `REACT_APP_PUSHER_CLUSTER` = Your Pusher Cluster

**For Functions:**
- `PUSHER_APP_ID` = Your Pusher App ID
- `PUSHER_KEY` = Your Pusher Key
- `PUSHER_SECRET` = Your Pusher Secret
- `PUSHER_CLUSTER` = Your Pusher Cluster

## Important Notes

### Limitations:

1. **Game State**: Currently uses in-memory storage in Netlify Functions, which resets on cold starts. For production, use:
   - FaunaDB (free tier)
   - MongoDB Atlas (free tier)
   - Supabase (free tier)
   - DynamoDB

2. **Custom Questions**: Stored in file system, which works but isn't ideal for serverless. Consider using a database.

3. **Pusher Free Tier**:
   - 200,000 messages/day
   - 100 concurrent connections
   - Usually enough for small to medium games

### Cost:

- **Netlify**: Free (100GB bandwidth, 300 build minutes/month)
- **Pusher**: Free tier (200k messages/day, 100 concurrent connections)
- **Total**: $0/month for small to medium usage!

## Alternative: Use Supabase Instead of Pusher

If you prefer, you can use Supabase which provides:
- Real-time subscriptions (WebSocket-like)
- Database for game state
- Free tier

Would you like me to create a Supabase version instead?

## Troubleshooting

**Functions not working?**
- Check Netlify Functions logs
- Verify environment variables are set
- Ensure `netlify/functions/package.json` has dependencies

**Pusher not connecting?**
- Verify Pusher credentials are correct
- Check browser console for errors
- Ensure Pusher app is active

**Game state resets?**
- This is expected with in-memory storage
- Implement database storage for persistence

