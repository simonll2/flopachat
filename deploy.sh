#!/bin/bash
set -e

echo "=== Deploying Flopachat E-Commerce on Kubernetes ==="

echo "[1/9] Creating namespace..."
kubectl apply -f k8s/namespace.yml

echo "[2/9] Applying secrets..."
kubectl apply -f k8s/k8s-secrets.yml

echo "[3/9] Deploying MongoDB..."
kubectl apply -f k8s/mongo-pvc.yml
kubectl apply -f k8s/mongo-deployment.yml
kubectl apply -f k8s/mongo-service.yml

echo "[4/9] Deploying server..."
kubectl apply -f k8s/server-pvc.yml
kubectl apply -f k8s/server-deployment.yml
kubectl apply -f k8s/server-service.yml

echo "[5/9] Deploying stats-service..."
kubectl apply -f k8s/stats-deployment.yml
kubectl apply -f k8s/stats-service.yml

echo "[6/9] Deploying front..."
kubectl apply -f k8s/front-deployment.yml
kubectl apply -f k8s/front-service.yml

echo "[7/9] Applying Ingress..."
kubectl apply -f k8s/ingress.yml

echo "[8/9] Applying NetworkPolicy..."
kubectl apply -f k8s/network-policy.yml

echo "[9/9] Verifying deployment..."
kubectl get all -n flopachat

echo ""
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=Ready pods --all -n flopachat --timeout=120s
echo "All pods are ready!"

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Next steps:"
echo "  1. Run 'minikube addons enable ingress' if not already done"
echo "  2. Add '\$(minikube ip) marketplace.local' to /etc/hosts"
echo "  3. Open http://marketplace.local in your browser"
echo "  4. Run 'kubectl get pods -n flopachat' to check pod status"
echo "  5. Run 'kubectl logs <pod-name> -n flopachat' to check logs"
