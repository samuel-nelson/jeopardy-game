# Deploy Everything to Netlify - Complete Guide

Your Jeopardy game can now run entirely on Netlify using:
- **Netlify Functions** for the API (serverless)
- **Pusher** for real-time WebSocket functionality
- **Static React frontend**

## Quick Start

1. **Get Pusher credentials** (free): https://pusher.com
2. **Deploy to Netlify**: Connect GitHub repo
3. **Set environment variables** (see below)
4. **Done!**

See `QUICK_NETLIFY_FULL.md` for step-by-step instructions.

## Architecture

```
┌─────────────────┐
│   Netlify       │
│                 │
│  ┌───────────┐  │
│  │  React    │  │  Static Frontend
│  │  Frontend │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │ Netlify   │  │  Serverless Functions
│  │ Functions │  │  (API endpoints)
│  └───────────┘  │
└─────────────────┘
         │
         │ WebSocket
         ▼
┌─────────────────┐
│     Pusher      │  Real-time messaging
│  (Free Tier)    │
└─────────────────┘
```

## Files Created

- `netlify/functions/questions.js` - API for question management
- `netlify/functions/pusher-trigger.js` - WebSocket event handler
- `netlify/functions/package.json` - Function dependencies
- `netlify.toml` - Netlify configuration
- `client/src/services/pusherService.ts` - Pusher client service

## Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

**Frontend (REACT_APP_*):**
- `REACT_APP_PUSHER_KEY` = Your Pusher Key
- `REACT_APP_PUSHER_CLUSTER` = Your Pusher Cluster (e.g., `us2`)

**Functions:**
- `PUSHER_APP_ID` = Your Pusher App ID
- `PUSHER_KEY` = Your Pusher Key
- `PUSHER_SECRET` = Your Pusher Secret
- `PUSHER_CLUSTER` = Your Pusher Cluster

## Next Steps

1. **Update client code** to use Pusher instead of Socket.io
   - See `client/src/services/pusherService.ts`
   - Update `Game.tsx` and `Lobby.tsx` to use `pusherService`

2. **For production**, add a database for game state:
   - FaunaDB (free tier)
   - MongoDB Atlas (free tier)
   - Supabase (free tier)

## Cost

- **Netlify**: Free (100GB bandwidth/month)
- **Pusher**: Free tier (200k messages/day, 100 concurrent connections)
- **Total**: $0/month for small to medium usage!

## Limitations

1. **In-memory game state** - Resets on function cold start. Add database for persistence.
2. **File-based custom questions** - Works but consider database for production.
3. **Pusher free tier limits** - Usually enough for small games.

## Documentation

- `QUICK_NETLIFY_FULL.md` - Quick deployment guide
- `NETLIFY_FULL_STACK.md` - Detailed instructions
- `netlify.toml` - Configuration file

