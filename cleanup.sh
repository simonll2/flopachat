#!/bin/bash
set -e

echo "=== Cleaning up Flopachat (full removal) ==="

echo "[1/3] Deleting namespace (removes all resources inside)..."
kubectl delete namespace flopachat --ignore-not-found

echo "[2/3] Removing Docker images..."
docker rmi devbsamy/server:v1.0 devbsamy/front:v1.0 devbsamy/stats-service:v1.0 2>/dev/null || true

echo "[3/3] Verifying..."
kubectl get namespace flopachat 2>/dev/null && echo "Namespace still exists (deleting...)" || echo "Namespace deleted."

echo ""
echo "=== Cleanup complete ==="
echo "PersistentVolumes may still exist. Run 'kubectl get pv' to check."
echo "To also stop Minikube: minikube stop"
echo "To fully delete Minikube: minikube delete"
