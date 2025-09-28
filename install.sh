#!/bin/bash

echo "🚀 Setting up AI-Powered Email Subject Line Optimizer"
echo "=================================================="

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Setup backend environment
echo "🔧 Setting up backend environment..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Backend .env created from template"
else
    echo "⚠️  Backend .env already exists"
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Setup frontend environment
echo "🔧 Setting up frontend environment..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Frontend .env created from template"
else
    echo "⚠️  Frontend .env already exists"
fi
cd ..

echo "✅ Installation complete!"
echo ""
echo "📝 Environment files created:"
echo "  - backend/.env (with OpenAI API key)"
echo "  - frontend/.env (with API base URL)"
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on http://localhost:3001"
echo "Frontend will run on http://localhost:3000"
