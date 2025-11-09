# Quick Guide: Deploy Everything to Netlify

## What You Need

1. **Netlify account** (free) - https://netlify.com
2. **Pusher account** (free tier) - https://pusher.com
3. **GitHub repository**

## Step 1: Get Pusher Credentials (5 minutes)

1. Sign up at https://pusher.com (free)
2. Create a Channels app
3. Note these values:
   - **App ID**
   - **Key** (this is your public key)
   - **Secret** (keep this secret!)
   - **Cluster** (e.g., `us2`)

## Step 2: Deploy to Netlify (10 minutes)

1. **Push code to GitHub** (if not already)
2. **Go to Netlify**: https://app.netlify.com
3. **Import from Git** → Select your repo
4. **Build settings** (auto-detected from `netlify.toml`):
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
5. **Environment Variables** (Site settings → Environment):
   
   **Frontend:**
   - `REACT_APP_PUSHER_KEY` = Your Pusher Key
   - `REACT_APP_PUSHER_CLUSTER` = Your Pusher Cluster
   
   **Functions:**
   - `PUSHER_APP_ID` = Your Pusher App ID
   - `PUSHER_KEY` = Your Pusher Key
   - `PUSHER_SECRET` = Your Pusher Secret
   - `PUSHER_CLUSTER` = Your Pusher Cluster

6. **Deploy!**

## Step 3: Update Client Code (Optional)

The code currently uses Socket.io. To use Pusher instead:

1. Update `client/src/pages/Game.tsx` to use `pusherService` instead of `socketService`
2. Update `client/src/pages/Lobby.tsx` similarly

Or create a service adapter that switches based on environment.

## That's It! 🎉

Your app is now fully on Netlify:
- ✅ Frontend: Static site
- ✅ API: Netlify Functions
- ✅ Real-time: Pusher

## Cost: $0/month

- Netlify: Free tier
- Pusher: Free tier (200k messages/day, 100 concurrent connections)

## Important Notes

1. **Game state is in-memory** - resets on function cold start. For production, add a database (FaunaDB, MongoDB Atlas, Supabase - all have free tiers).

2. **Custom questions** stored in file system - works but consider database for production.

3. **Pusher free tier** is usually enough for small to medium games.

## Troubleshooting

**Functions not working?**
- Check Netlify Functions logs
- Verify all environment variables are set
- Ensure `netlify/functions/package.json` exists

**Pusher errors?**
- Double-check credentials
- Verify Pusher app is active
- Check browser console

See `NETLIFY_FULL_STACK.md` for detailed instructions.

