#!/bin/bash
set -e

echo "=== Deploying Flopachat E-Commerce on Kubernetes ==="

echo "[1/13] Creating namespace..."
kubectl apply -f k8s/namespace.yml

echo "[2/13] Applying ResourceQuota and LimitRange..."
kubectl apply -f k8s/resource-quota.yml

echo "[3/13] Applying RBAC (ServiceAccount, Role, RoleBinding)..."
kubectl apply -f k8s/rbac.yml

echo "[4/13] Applying ConfigMap..."
kubectl apply -f k8s/configmap.yml

echo "[5/13] Applying Secrets..."
kubectl apply -f k8s/k8s-secrets.yml

echo "[6/13] Applying TLS Secret..."
kubectl apply -f k8s/tls-secret.yml

echo "[7/13] Deploying MongoDB..."
kubectl apply -f k8s/mongo-pvc.yml
kubectl apply -f k8s/mongo-deployment.yml
kubectl apply -f k8s/mongo-service.yml

echo "[8/13] Deploying server..."
kubectl apply -f k8s/server-pvc.yml
kubectl apply -f k8s/server-deployment.yml
kubectl apply -f k8s/server-service.yml

echo "[9/13] Deploying stats-service..."
kubectl apply -f k8s/stats-deployment.yml
kubectl apply -f k8s/stats-service.yml

echo "[10/13] Deploying front..."
kubectl apply -f k8s/front-deployment.yml
kubectl apply -f k8s/front-service.yml

echo "[11/13] Applying Ingress (with TLS)..."
kubectl apply -f k8s/ingress.yml

echo "[12/13] Applying NetworkPolicies..."
kubectl apply -f k8s/network-policy.yml

echo "[13/13] Applying HorizontalPodAutoscaler..."
kubectl apply -f k8s/hpa.yml

echo ""
echo "Verifying deployment..."
kubectl get all -n flopachat

echo ""
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=Ready pods --all -n flopachat --timeout=120s
echo "All pods are ready!"

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Resources deployed:"
echo "  - Namespace: flopachat"
echo "  - ConfigMap: app-config"
echo "  - Secrets: app-secrets, tls-secret"
echo "  - RBAC: ServiceAccount, Role, RoleBinding"
echo "  - ResourceQuota + LimitRange"
echo "  - NetworkPolicies: default-deny-all, allow-front, allow-server, allow-stats, allow-mongo"
echo "  - HPA: server-hpa, front-hpa"
echo "  - Deployments: mongo, server, stats-service, front"
echo "  - Services: mongo, server-service, stats-service, front-service"
echo "  - Ingress: app-ingress (TLS enabled)"
echo ""
echo "Next steps:"
echo "  1. Run 'minikube addons enable ingress' if not already done"
echo "  2. Add '\$(minikube ip) marketplace.local' to /etc/hosts"
echo "  3. Open http://marketplace.local in your browser"
echo "  4. Run 'kubectl get pods -n flopachat' to check pod status"
echo "  5. Run 'kubectl get hpa -n flopachat' to check autoscaler"
echo "  6. Run 'kubectl get networkpolicy -n flopachat' to verify network policies"
