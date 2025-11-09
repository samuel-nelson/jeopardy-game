#!/bin/bash

# Deployment preparation script
echo "🚀 Preparing Jeopardy game for deployment..."

# Build the client
echo "📦 Building React client..."
cd client
npm install
npm run build
cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Build failed! client/build directory not found."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📝 Next steps:"
echo "1. Initialize git: git init"
echo "2. Add files: git add ."
echo "3. Commit: git commit -m 'Ready for deployment'"
echo "4. Create GitHub repo and push"
echo "5. Deploy on Render.com (see DEPLOYMENT.md)"
echo ""
echo "✨ Ready to deploy!"

