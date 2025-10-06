#!/bin/bash

echo "🚀 Starting database reset..."

# Stop the server if running
echo "⏹️  Stopping server..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

# Run the reset script
echo "🗑️  Resetting database..."
npm run db:clean

echo "✅ Database reset complete!"
echo ""
echo "You can now start the server with: npm run dev"
echo "Admin login: admin@dermatouch.com / admin123"