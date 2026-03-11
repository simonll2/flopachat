#!/bin/bash
set -e

echo "=== Deploying Flopachat E-Commerce on Kubernetes ==="

echo "[1/9] Creating namespace..."
kubectl apply -f namespace.yml

echo "[2/9] Applying secrets..."
kubectl apply -f k8s-secrets.yml

echo "[3/9] Deploying MongoDB..."
kubectl apply -f mongo-pvc.yml
kubectl apply -f mongo-deployment.yml
kubectl apply -f mongo-service.yml

echo "[4/9] Deploying server..."
kubectl apply -f server-pvc.yml
kubectl apply -f server-deployment.yml
kubectl apply -f server-service.yml

echo "[5/9] Deploying stats-service..."
kubectl apply -f stats-deployment.yml
kubectl apply -f stats-service.yml

echo "[6/9] Deploying front..."
kubectl apply -f front-deployment.yml
kubectl apply -f front-service.yml

echo "[7/9] Applying Ingress..."
kubectl apply -f ingress.yml

echo "[8/9] Applying NetworkPolicy..."
kubectl apply -f network-policy.yml

echo "[9/9] Verifying deployment..."
kubectl get all -n flopachat

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Next steps:"
echo "  1. Run 'minikube addons enable ingress' if not already done"
echo "  2. Add '\$(minikube ip) marketplace.local' to /etc/hosts"
echo "  3. Open http://marketplace.local in your browser"
echo "  4. Run 'kubectl get pods -n flopachat' to check pod status"
echo "  5. Run 'kubectl logs <pod-name> -n flopachat' to check logs"
