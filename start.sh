#!/bin/bash

# ==============================================================================
# FOODOSCOPE LAUNCHER (Servers Only)
# ==============================================================================
# Usage: ./start.sh
# 
# 1. Activates Virtual Environment
# 2. Starts Backend Server (Port 8000)
# 3. Starts Frontend Server (Port 8001)
# ==============================================================================

# 1. NAVIGATE TO PROJECT ROOT
cd "$(dirname "$0")"

# 2. ACTIVATE VIRTUAL ENVIRONMENT
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Error: Virtual environment not found."
    exit 1
fi

echo "✅ Virtual Environment Activated"

# 3. START BACKEND (Port 8000)
echo "🧠 Starting Backend on Port 8000..."
# We run from root so Python finds the module path correctly
uvicorn backend.server:app --reload --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!

# Give it a moment to boot
sleep 2

# Check if Backend is alive
if ps -p $BACKEND_PID > /dev/null; then
   echo "   -> Backend running (PID: $BACKEND_PID)"
else
   echo "   ❌ Backend failed to start."
   exit 1
fi

# 4. START FRONTEND (Port 8001)
echo "🎨 Starting Frontend on Port 8001..."
# Using --directory so we don't need to cd (keeps cleanup path predictable)
python3 -m http.server 8001 --directory frontend > /dev/null 2>&1 &
FRONTEND_PID=$!
echo "   -> Frontend running (PID: $FRONTEND_PID)"

# 5. OPEN BROWSER
# Small pause so the HTTP server is ready before the browser hits it
sleep 1
echo "🚀 Launching Browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8001
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8001
fi

# 6. CLEANUP ON EXIT
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT

echo ""
echo "✨ App is running!"
echo "   Frontend: http://localhost:8001"
echo "   Backend:  http://localhost:8000"
echo "   (Press Ctrl+C to stop)"

wait