#!/bin/bash

# Unified Runner Script for Gecko Hex Dashboard
# This script starts both backend and frontend servers with timestamped logging

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create logs directory if it doesn't exist
mkdir -p logs

# Generate timestamp in format HH-MM_MM-DD-YYYY
TIMESTAMP=$(date +"%H-%M_%m-%d-%Y")

# Define log file paths
BACKEND_LOG="logs/${TIMESTAMP}_BACKEND.txt"
FRONTEND_LOG="logs/${TIMESTAMP}_FRONTEND.txt"

# Create log files
touch "$BACKEND_LOG"
touch "$FRONTEND_LOG"

echo "========================================="
echo "Gecko Hex Dashboard Unified Runner"
echo "========================================="
echo "Starting services at: $(date)"
echo "Backend log:  $BACKEND_LOG"
echo "Frontend log: $FRONTEND_LOG"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Store PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function to stop all processes
cleanup() {
    echo ""
    echo "========================================="
    echo "Shutting down services..."
    echo "========================================="
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    echo "All services stopped."
    echo "Logs saved:"
    echo "  - $BACKEND_LOG"
    echo "  - $FRONTEND_LOG"
    exit 0
}

# Set up trap to call cleanup on script termination
trap cleanup SIGINT SIGTERM EXIT

# Start backend (Flask)
echo "Starting backend server..."
cd backend
python3 app.py > "../$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
cd ..
echo "Backend started (PID: $BACKEND_PID)"

# Wait a moment for backend to initialize
sleep 2

# Start frontend (Simple HTTP server on port 3000)
echo "Starting frontend server..."
cd frontend
python3 -m http.server 3000 > "../$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd ..
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "========================================="
echo "Both services are running!"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "========================================="
echo ""

# Wait for both processes to complete (they won't unless killed)
wait $BACKEND_PID $FRONTEND_PID
