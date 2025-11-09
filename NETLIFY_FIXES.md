# Netlify Deployment Fixes

## Issues Fixed

### 1. Build Configuration
- Changed `base` from `"client"` to `"."` so functions can access server data
- Updated build command to `cd client && npm install && npm run build`
- Set publish directory to `client/build`

### 2. Default Questions Path
- Created `netlify/functions/defaultQuestions.js` with embedded questions
- Functions now use embedded questions instead of file system paths
- Fallback to file system if embedded version fails

### 3. Custom Questions Storage
- Changed to use `/tmp` directory (Netlify writable location)
- Custom questions saved to `/tmp/jeopardy-custom-questions/`
- Works in Netlify's serverless environment

### 4. Function Paths
- Updated all path references to work with Netlify's file structure
- Added multiple fallback paths for compatibility

## What to Check in Netlify

1. **Build Settings**:
   - Base directory: `.` (root)
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`

2. **Environment Variables** (required for Pusher):
   - `REACT_APP_PUSHER_KEY`
   - `REACT_APP_PUSHER_CLUSTER`
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`

3. **Function Directory**:
   - Should be `netlify/functions` (auto-detected from netlify.toml)

## Testing

After deploying, check:
- ✅ Build completes successfully
- ✅ Functions are accessible at `/.netlify/functions/questions`
- ✅ Default questions load
- ✅ Pusher connections work (if credentials set)

## Common Errors Fixed

- ❌ "Cannot find module" → Fixed with embedded questions
- ❌ "Path not found" → Fixed with /tmp for custom questions
- ❌ "Build fails" → Fixed build configuration
- ❌ "Functions not found" → Fixed directory structure

