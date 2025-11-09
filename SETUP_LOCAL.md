# Local Setup Guide

## Step 1: Install Node.js

You need Node.js installed first. Choose one method:

### Option A: Official Installer (Easiest)
1. Go to https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Verify: Open terminal and run `node --version`

### Option B: Homebrew
```bash
brew install node
```

### Option C: Using nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install --lts
```

## Step 2: Install Dependencies

Once Node.js is installed, run:

```bash
cd /Users/admin/Desktop/Jep
npm run install-all
```

This will install dependencies for:
- Root package
- Server package
- Client package

## Step 3: Run the Application

### Development Mode (Recommended)

Run both server and client together:

```bash
npm run dev
```

This starts:
- **Backend server** on http://localhost:5000
- **React frontend** on http://localhost:3000

Open http://localhost:3000 in your browser!

### Or Run Separately

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run client
```

## Step 4: Play!

1. Open http://localhost:3000
2. Enter your name
3. Create a room or join one
4. Start playing!

## Troubleshooting

**Port already in use?**
- Kill the process using port 3000 or 5000
- Or change ports in the config files

**Dependencies fail to install?**
- Make sure Node.js version is 18 or higher
- Try deleting `node_modules` folders and reinstalling

**Build errors?**
- Check that all dependencies installed correctly
- Make sure you're in the project root directory

