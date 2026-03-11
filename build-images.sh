#!/bin/bash
set -e

echo "=== Building Docker images ==="

echo "[1/3] Building server..."
docker build -t devbsamy/server:v1.0 ./server

echo "[2/3] Building front..."
docker build -t devbsamy/front:v1.0 ./front

echo "[3/3] Building stats-service..."
docker build -t devbsamy/stats-service:v1.0 ./stats-service

echo ""
echo "=== All images built ==="
echo "Run 'docker images | grep devbsamy' to verify"
