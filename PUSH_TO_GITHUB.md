# Push to GitHub - Quick Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `jeopardy-game` (or any name you prefer)
3. Description: "Fully functioning Jeopardy game with multiplayer support"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
cd /Users/admin/Desktop/Jep

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/jeopardy-game.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using SSH

If you have SSH keys set up:

```bash
git remote add origin git@github.com:YOUR_USERNAME/jeopardy-game.git
git branch -M main
git push -u origin main
```

## That's It! 🎉

Your code is now on GitHub and ready to deploy to Netlify!

## Next Steps

1. **Deploy to Netlify**: Connect your GitHub repo
2. **Set Pusher credentials**: Add environment variables
3. **Play!**: Your game will be live

See `DEPLOY_NETLIFY_FINAL.md` for deployment instructions.

