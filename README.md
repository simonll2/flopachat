# Flopachat — Application E-Commerce sur Kubernetes

Application e-commerce complète déployée sur Kubernetes (Minikube), avec architecture microservices, persistance des données, sécurisation avancée du cluster et Infrastructure as Code (Terraform).

## Stack technique

- **Frontend** : Vue.js 3 + Vuex + Vue Router + Bootstrap 5
- **Backend** : Express.js (API REST)
- **Base de données** : MongoDB 7
- **Paiement** : Stripe (mode test)
- **Conteneurisation** : Docker (multi-stage build pour le front)
- **Orchestration** : Kubernetes (Minikube) + Nginx Ingress Controller
- **Infrastructure as Code** : Terraform (provider Kubernetes)
- **Sécurité** : TLS/HTTPS, RBAC, NetworkPolicy, Kubernetes Secrets, ResourceQuota

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                Kubernetes Cluster (namespace: flopachat)             │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │ RBAC: ServiceAccount + Role + RoleBinding (least privilege) │     │
│  │ ResourceQuota: CPU 2/4, RAM 2Gi/4Gi, 20 pods max           │     │
│  │ LimitRange: default CPU 250m, RAM 256Mi per container       │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────┐    ┌──────────────┐   ┌────────────────┐              │
│  │  Front   │    │   Server     │   │ Stats Service  │              │
│  │ (Vue.js) │    │  (Express)   │──▶│  (Express)     │              │
│  │  :80     │    │   :5000      │   │   :4000        │              │
│  │  HPA 1-3 │    │   HPA 1-5   │   │                │              │
│  └────┬─────┘    └──────┬───────┘   └───────┬────────┘              │
│       │                 │                    │                        │
│       │                 └────────┬───────────┘                       │
│       │                         ▼                                    │
│       │               ┌──────────────┐                               │
│       │               │   MongoDB    │                               │
│       │               │   :27017     │                               │
│       │               │  (+ PVC)     │                               │
│       │               └──────────────┘                               │
│       │                    ▲                                         │
│       │                    │ NetworkPolicy                           │
│       │                    │ (default-deny + allow server/stats)     │
│  ─────┴────────────────────┴─────────────                           │
│        Nginx Ingress Controller (TLS/HTTPS)                         │
│        marketplace.local/     → front                                │
│        marketplace.local/api  → server                               │
└──────────────────────────────────────────────────────────────────────┘
```

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Terraform](https://developer.hashicorp.com/terraform/install) (optionnel, pour le déploiement IaC)

---

## Installation sur Linux natif

### 1. Installer les dépendances

```sh
# Docker
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### 2. Démarrer Minikube

```sh
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server   # Requis pour le HPA
```

### 3. Construire et déployer

```sh
eval $(minikube docker-env)
./build-images.sh
./deploy.sh
```

### 4. Configurer l'accès

```sh
# Ajouter marketplace.local dans /etc/hosts
echo "$(minikube ip) marketplace.local" | sudo tee -a /etc/hosts
```

### 5. Accéder à l'application

Ouvrir [http://marketplace.local](http://marketplace.local) dans le navigateur.

---

## Installation sur WSL2 (Windows)

> WSL2 utilise un réseau virtuel interne. `minikube ip` retourne une IP accessible uniquement depuis WSL, pas depuis le navigateur Windows. Il faut donc utiliser `minikube tunnel`.

### 1. Prérequis côté Windows

- **WSL2** activé avec une distribution Ubuntu (22.04+)
- **Docker Desktop** installé et configuré pour utiliser le backend WSL2
  - Dans Docker Desktop : Settings → Resources → WSL Integration → activer pour votre distribution

### 2. Installer kubectl et Minikube dans WSL

```sh
# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### 3. Démarrer Minikube

```sh
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
```

### 4. Construire et déployer

```sh
eval $(minikube docker-env)
./build-images.sh
./deploy.sh
```

### 5. Lancer le tunnel (spécifique WSL2)

Dans un terminal WSL dédié (à laisser ouvert) :

```sh
minikube tunnel
```

> Cela expose les services Ingress sur `127.0.0.1` dans WSL, qui est aussi accessible depuis Windows.

### 6. Configurer l'accès

Éditer le fichier hosts **côté Windows** (`C:\Windows\System32\drivers\etc\hosts`) en tant qu'administrateur et ajouter :

```
127.0.0.1 marketplace.local
```

> **Note :** avec `minikube tunnel`, l'IP est toujours `127.0.0.1`, pas celle retournée par `minikube ip`.

### 7. Accéder à l'application

Ouvrir [http://marketplace.local](http://marketplace.local) dans le navigateur Windows.

---

## Déploiement alternatif : Docker Compose (développement local)

Pour un démarrage rapide sans Kubernetes :

```sh
docker compose up --build
```

L'application sera accessible sur [http://localhost:8080](http://localhost:8080).

L'architecture Docker Compose reproduit le même routage que Kubernetes :
- Un conteneur **gateway** (nginx reverse proxy) joue le rôle de l'Ingress
- `/api` et `/static` sont routés vers le **server**
- `/` est routé vers le **front**

Pour arrêter :

```sh
docker compose down
```

---

## Déploiement alternatif : Terraform (Infrastructure as Code)

Pour déployer toute l'infrastructure via Terraform (nécessite Minikube démarré + Ingress + metrics-server activés) :

```sh
# Prérequis
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
eval $(minikube docker-env)
./build-images.sh          # Build les images Docker localement

# Déploiement Terraform
cd terraform
terraform init
terraform plan             # Aperçu de ce qui sera créé
terraform apply            # Déploie toute l'infrastructure
```

Terraform crée **toutes** les ressources Kubernetes en une seule commande :
namespace, deployments, services, ingress (TLS), secrets, configmap, RBAC, network policies, resource quotas, HPA.

> **Note** : les valeurs sensibles (MongoDB URI, JWT secret, clé Stripe) ont des valeurs par défaut fonctionnelles pour le mode développement. Pour les personnaliser : `cp terraform.tfvars.example terraform.tfvars` et éditer le fichier.

Pour détruire l'infrastructure :

```sh
terraform destroy
```

---

## Informations communes

**Compte admin par défaut :** `admin@admin.com` / `admin`

## Fonctionnalités

- **Authentification** : inscription, connexion, gestion de profil avec photo
- **Catalogue produits** : liste, détail, recherche, système de votes (thumbs up/down)
- **Panier** : ajout, modification des quantités, suppression
- **Commandes** : historique, détail, suivi de statut
- **Paiement** : intégration Stripe (mode test)
- **Administration** : gestion des produits, utilisateurs, commandes, tableau de bord statistiques
- **Statistiques** : microservice dédié avec plusieurs endpoints d'agrégation MongoDB (CA total, stats mensuelles, top produits, résumé enrichi)

## Architecture microservices

L'application est composée de 2 backends indépendants :

1. **server** (port 5000) : API principale gérant l'authentification, les produits, le panier, les commandes et le paiement
2. **stats-service** (port 4000) : microservice dédié aux statistiques, avec pipelines d'agrégation MongoDB avancés (`$group`, `$unwind`, `$lookup`, `$dateToString`, `$sort`, `$limit`)

Le serveur principal agit comme **proxy** pour les requêtes `/api/stats/*`, les transmettant au stats-service via HTTP interne au cluster Kubernetes. Cela démontre la **communication inter-services** au sein du cluster.

### Endpoints du stats-service

| Endpoint | Description |
|----------|-------------|
| `GET /stats` | Totaux globaux (CA et nombre de commandes livrées) |
| `GET /stats/summary` | Résumé enrichi : CA, commandes livrées, panier moyen, répartition par statut |
| `GET /stats/monthly` | CA et commandes par mois (12 derniers mois) |
| `GET /stats/top-products` | Top 5 produits les plus vendus (avec `$unwind` + `$lookup`) |

> **Note sécurité** : Les secrets dans `k8s/k8s-secrets.yml` sont en mode développement/test uniquement. En production, il faudrait utiliser Sealed Secrets, HashiCorp Vault ou Mozilla SOPS.

## Sécurisation du cluster

| Mesure | Description |
|--------|-------------|
| **TLS/HTTPS** | Certificat TLS auto-signé sur l'Ingress (en production : cert-manager + Let's Encrypt) |
| **RBAC** | ServiceAccount dédié avec Role et RoleBinding (principe du moindre privilège) |
| **NetworkPolicy** | Default deny-all + règles explicites par service (front, server, stats, mongo) |
| **Kubernetes Secrets** | Les credentials (MongoDB URI, JWT secret, clé Stripe) sont stockés dans un Secret K8s et injectés via `envFrom` |
| **ConfigMap** | Les configurations non-sensibles (CORS, URLs internes, NODE_ENV) sont séparées dans un ConfigMap |
| **ResourceQuota** | Limite globale du namespace : CPU 2/4, RAM 2Gi/4Gi, max 20 pods, 5 PVC |
| **LimitRange** | Valeurs par défaut par conteneur : CPU 250m, RAM 256Mi |
| **CORS restreint** | L'origine est limitée à `http://marketplace.local` |
| **Health checks** | Liveness et readiness probes sur tous les deployments |
| **PVC** | Persistance des données MongoDB et des fichiers uploadés (images) |
| **Namespace dédié** | Tous les manifests sont dans le namespace `flopachat` |
| **Image versioning** | Tags versionnés (`:v1.0`) au lieu de `:latest` |

## Scaling automatique (HPA)

L'application utilise des `HorizontalPodAutoscaler` pour le scaling automatique :

| Service | Min replicas | Max replicas | Métrique CPU | Métrique mémoire |
|---------|-------------|-------------|--------------|------------------|
| server | 1 | 5 | 70% | 80% |
| front | 1 | 3 | 70% | — |

Le HPA nécessite le metrics-server de Minikube : `minikube addons enable metrics-server`

## Technologies et patterns

### Kubernetes
- Namespace dédié
- Deployments avec readiness/liveness probes
- Services ClusterIP
- Ingress Nginx avec TLS
- PersistentVolumeClaim (MongoDB + fichiers statiques)
- Kubernetes Secrets + ConfigMap
- NetworkPolicy (default-deny + allow explicites)
- RBAC (ServiceAccount + Role + RoleBinding)
- ResourceQuota + LimitRange
- HorizontalPodAutoscaler (autoscaling)
- initContainers (attente de MongoDB)
- Resource requests/limits sur chaque conteneur

### Docker
- Multi-stage build (frontend : node → nginx)
- `.dockerignore` pour optimiser les images
- `node:18-alpine` pour des images légères
- Docker Compose pour le développement local

### Infrastructure as Code
- Terraform avec le provider Kubernetes
- Variables paramétrables (images, tailles de stockage)
- Outputs pour vérifier les ressources déployées
- Toute l'infrastructure reproductible en une commande

### Application
- Proxy inter-services via axios
- JWT pour l'authentification
- Bcrypt pour le hashing des mots de passe
- Multer pour l'upload de fichiers
- Stripe pour le paiement
- Vuex pour la gestion d'état
- Chart.js pour les graphiques

## Commandes utiles

```sh
# Vérifier l'état des pods
kubectl get pods -n flopachat

# Voir les logs d'un pod
kubectl logs <pod-name> -n flopachat

# Vérifier les services
kubectl get svc -n flopachat

# Vérifier l'ingress
kubectl get ingress -n flopachat

# Vérifier l'autoscaler
kubectl get hpa -n flopachat

# Vérifier les network policies
kubectl get networkpolicy -n flopachat

# Vérifier les quotas
kubectl get resourcequota -n flopachat

# Vérifier le RBAC
kubectl get sa,role,rolebinding -n flopachat

# Arrêter tous les pods (sans supprimer les données)
./stop.sh

# Supprimer tout (namespace, images Docker, données)
./cleanup.sh

# Démarrage rapide avec Docker Compose
docker compose up --build

# Déploiement Terraform
cd terraform && terraform init && terraform apply
```

## Structure du projet

```
├── deploy.sh                  # Script de déploiement Kubernetes
├── build-images.sh            # Script de build des images Docker
├── stop.sh                    # Arrêt des pods (données conservées)
├── cleanup.sh                 # Suppression complète (namespace + images)
├── docker-compose.yml         # Environnement de développement local
├── k8s/                       # Manifests Kubernetes
│   ├── namespace.yml          # Namespace flopachat
│   ├── configmap.yml          # ConfigMap (configs non-sensibles)
│   ├── k8s-secrets.yml        # Secrets (credentials, mode dev/test)
│   ├── tls-secret.yml         # Certificat TLS auto-signé
│   ├── rbac.yml               # ServiceAccount + Role + RoleBinding
│   ├── resource-quota.yml     # ResourceQuota + LimitRange
│   ├── network-policy.yml     # NetworkPolicies (deny-all + allow explicites)
│   ├── hpa.yml                # HorizontalPodAutoscaler (server + front)
│   ├── mongo-pvc.yml          # PVC pour MongoDB
│   ├── server-pvc.yml         # PVC pour fichiers uploadés
│   ├── mongo-deployment.yml   # Deployment MongoDB (probes + resources)
│   ├── mongo-service.yml      # Service MongoDB
│   ├── server-deployment.yml  # Deployment serveur principal
│   ├── server-service.yml     # Service serveur principal
│   ├── stats-deployment.yml   # Deployment stats-service
│   ├── stats-service.yml      # Service stats-service
│   ├── front-deployment.yml   # Deployment frontend
│   ├── front-service.yml      # Service frontend
│   └── ingress.yml            # Ingress (TLS + routage path-based)
├── nginx-proxy/               # Reverse proxy pour Docker Compose
│   ├── Dockerfile             # Image nginx
│   └── nginx.conf             # Routage /api → server, / → front
├── terraform/                 # Infrastructure as Code
│   ├── main.tf                # Provider Kubernetes (Minikube)
│   ├── variables.tf           # Variables paramétrables
│   ├── namespace.tf           # Namespace
│   ├── storage.tf             # PVC (MongoDB + static)
│   ├── deployments.tf         # Deployments (mongo, server, stats, front)
│   ├── services.tf            # Services Kubernetes
│   ├── security.tf            # Secrets, ConfigMap, RBAC, NetworkPolicy, Quotas
│   ├── ingress.tf             # TLS Secret + Ingress avec TLS
│   ├── hpa.tf                 # HorizontalPodAutoscaler
│   ├── outputs.tf             # Outputs Terraform
│   └── certs/                 # Certificats TLS auto-signés (dev)
├── front/                     # Application Vue.js 3
├── server/                    # API Express.js principale
└── stats-service/             # Microservice statistiques
```
