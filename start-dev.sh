#!/bin/bash
# Start both backend and frontend in development mode

echo "🚀 Starting WhatsFlow Development Servers..."

# Start backend in background
cd whatsflow/backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background  
cd ../../frontend && npm run dev &
FRONTEND_PID=$!

echo "✓ Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
echo "✓ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
