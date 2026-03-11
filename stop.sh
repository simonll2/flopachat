#!/bin/bash
set -e

echo "=== Stopping Flopachat ==="

echo "[1/2] Scaling all deployments to 0..."
kubectl scale deployment --all --replicas=0 -n flopachat

echo "[2/2] Verifying..."
kubectl get pods -n flopachat

echo ""
echo "=== All pods stopped ==="
echo "Run './deploy.sh' to restart everything."
