# Local Development Guide

## How It Works

The app automatically detects the environment and uses the appropriate service:

- **Development (local)**: Uses Socket.io + Express server
- **Production (Netlify)**: Uses Pusher + Netlify Functions

## Running Locally

### Quick Start

```bash
# Install all dependencies
npm run install-all

# Run both server and client
npm run dev
```

This will start:
- **Backend**: http://localhost:5000 (Express + Socket.io)
- **Frontend**: http://localhost:3000 (React)

### How It Detects Mode

The app checks:
1. `REACT_APP_USE_PUSHER` environment variable
2. `NODE_ENV === 'production'` AND `REACT_APP_PUSHER_KEY` exists

If neither condition is true, it uses Socket.io (local development).

## Local Development Features

✅ **No external services needed** - Works completely offline  
✅ **Socket.io** - Real-time multiplayer via local server  
✅ **Express API** - Question management via local server  
✅ **Full functionality** - All features work locally  

## Switching to Pusher Locally (Optional)

If you want to test Pusher locally:

1. Create a `.env` file in the `client` directory:
```
REACT_APP_USE_PUSHER=true
REACT_APP_PUSHER_KEY=your-pusher-key
REACT_APP_PUSHER_CLUSTER=us2
```

2. Run Netlify Dev:
```bash
npm install -g netlify-cli
netlify dev
```

This will:
- Run Netlify Functions locally
- Use Pusher for real-time features
- Mimic the production environment

## Troubleshooting

**Can't connect to server?**
- Make sure the server is running: `npm run server`
- Check that port 5000 is available

**Socket.io connection errors?**
- Verify the server started successfully
- Check browser console for errors

**API calls failing?**
- Ensure the Express server is running
- Check that `http://localhost:5000/api` is accessible

## Architecture

### Local Development
```
React App (localhost:3000)
    ↓
Socket.io Client ←→ Express Server (localhost:5000)
    ↓
Socket.io Server
```

### Production (Netlify)
```
React App (Netlify)
    ↓
Pusher Client ←→ Netlify Functions
    ↓
Pusher Service
```

## Environment Variables

### Local Development
No environment variables needed! Uses Socket.io by default.

### Production (Netlify)
Set these in Netlify dashboard:
- `REACT_APP_PUSHER_KEY`
- `REACT_APP_PUSHER_CLUSTER`
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`

## Summary

**Local**: Just run `npm run dev` - no setup needed!  
**Production**: Deploy to Netlify with Pusher credentials.

