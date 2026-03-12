# Flopachat — Application E-Commerce sur Kubernetes

Application e-commerce complète déployée sur Kubernetes (Minikube), avec architecture microservices, persistance des données et sécurisation du cluster.

## Stack technique

- **Frontend** : Vue.js 3 + Vuex + Vue Router + Bootstrap 5
- **Backend** : Express.js (API REST)
- **Base de données** : MongoDB 7
- **Paiement** : Stripe (mode test)
- **Conteneurisation** : Docker (multi-stage build pour le front)
- **Orchestration** : Kubernetes (Minikube) + Nginx Ingress Controller
- **Sécurité** : Kubernetes Secrets, NetworkPolicy, CORS restreint

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Kubernetes Cluster (namespace: flopachat)    │
│                                                          │
│  ┌──────────┐    ┌──────────────┐   ┌────────────────┐  │
│  │  Front   │    │   Server     │   │ Stats Service  │  │
│  │ (Vue.js) │    │  (Express)   │──▶│  (Express)     │  │
│  │  :80     │    │   :5000      │   │   :4000        │  │
│  └────┬─────┘    └──────┬───────┘   └───────┬────────┘  │
│       │                 │                    │           │
│       │                 └────────┬───────────┘           │
│       │                         ▼                        │
│       │               ┌──────────────┐                   │
│       │               │   MongoDB    │                   │
│       │               │   :27017     │                   │
│       │               │  (+ PVC)     │                   │
│       │               └──────────────┘                   │
│       │                    ▲                              │
│       │                    │ NetworkPolicy                │
│       │                    │ (server + stats only)        │
│  ─────┴────────────────────┴─────────────                │
│              Nginx Ingress Controller                    │
│        marketplace.local/     → front                    │
│        marketplace.local/api  → server                   │
└──────────────────────────────────────────────────────────┘
```

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

---

## Installation sur Linux natif

### 1. Installer les dependances

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

### 2. Demarrer Minikube

```sh
minikube start --driver=docker
minikube addons enable ingress
```

### 3. Construire et deployer

```sh
eval $(minikube docker-env)
./build-images.sh
./deploy.sh
```

### 4. Configurer l'acces

```sh
# Ajouter marketplace.local dans /etc/hosts
echo "$(minikube ip) marketplace.local" | sudo tee -a /etc/hosts
```

### 5. Acceder a l'application

Ouvrir [http://marketplace.local](http://marketplace.local) dans le navigateur.

---

## Installation sur WSL2 (Windows)

> WSL2 utilise un reseau virtuel interne. `minikube ip` retourne une IP accessible uniquement depuis WSL, pas depuis le navigateur Windows. Il faut donc utiliser `minikube tunnel`.

### 1. Prerequis cote Windows

- **WSL2** active avec une distribution Ubuntu (22.04+)
- **Docker Desktop** installe et configure pour utiliser le backend WSL2
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

### 3. Demarrer Minikube

```sh
minikube start --driver=docker
minikube addons enable ingress
```

### 4. Construire et deployer

```sh
eval $(minikube docker-env)
./build-images.sh
./deploy.sh
```

### 5. Lancer le tunnel (specifique WSL2)

Dans un terminal WSL dedie (a laisser ouvert) :

```sh
minikube tunnel
```

> Cela expose les services Ingress sur `127.0.0.1` dans WSL, qui est aussi accessible depuis Windows.

### 6. Configurer l'acces

Editer le fichier hosts **cote Windows** (`C:\Windows\System32\drivers\etc\hosts`) en tant qu'administrateur et ajouter :

```
127.0.0.1 marketplace.local
```

> **Note :** avec `minikube tunnel`, l'IP est toujours `127.0.0.1`, pas celle retournee par `minikube ip`.

### 7. Acceder a l'application

Ouvrir [http://marketplace.local](http://marketplace.local) dans le navigateur Windows.

---

## Informations communes

**Compte admin par defaut :** `admin@admin.com` / `admin`

## Fonctionnalites

- **Authentification** : inscription, connexion, gestion de profil avec photo
- **Catalogue produits** : liste, detail, recherche, systeme de votes (thumbs up/down)
- **Panier** : ajout, modification des quantites, suppression
- **Commandes** : historique, detail, suivi de statut
- **Paiement** : integration Stripe (mode test)
- **Administration** : gestion des produits, utilisateurs, commandes, tableau de bord statistiques
- **Statistiques** : microservice dedie avec plusieurs endpoints d'agregation MongoDB (CA total, stats mensuelles, top produits, resume enrichi)

## Architecture microservices

L'application est composee de 2 backends independants :

1. **server** (port 5000) : API principale gerant l'authentification, les produits, le panier, les commandes et le paiement
2. **stats-service** (port 4000) : microservice dedie aux statistiques, avec pipelines d'agregation MongoDB avances (`$group`, `$unwind`, `$lookup`, `$dateToString`, `$sort`, `$limit`)

Le serveur principal agit comme **proxy** pour les requetes `/api/stats/*`, les transmettant au stats-service via HTTP interne au cluster Kubernetes. Cela demontre la **communication inter-services** au sein du cluster.

### Endpoints du stats-service

| Endpoint | Description |
|----------|-------------|
| `GET /stats` | Totaux globaux (CA et nombre de commandes livrees) |
| `GET /stats/summary` | Resume enrichi : CA, commandes livrees, panier moyen, repartition par statut |
| `GET /stats/monthly` | CA et commandes par mois (12 derniers mois) |
| `GET /stats/top-products` | Top 5 produits les plus vendus (avec `$unwind` + `$lookup`) |

> **Note securite** : Les secrets dans `k8s/k8s-secrets.yml` sont en mode developpement/test uniquement. En production, il faudrait utiliser Sealed Secrets, HashiCorp Vault ou Mozilla SOPS.

## Securisation

| Mesure | Description |
|--------|-------------|
| **Kubernetes Secrets** | Les credentials (MongoDB URI, JWT secret, cle Stripe, CORS origin) sont stockes dans un Secret K8s et injectes via `envFrom` |
| **NetworkPolicy** | Seuls les pods `server` et `stats-service` peuvent acceder a MongoDB |
| **CORS restreint** | L'origine est limitee a `http://marketplace.local` |
| **Health checks** | Liveness et readiness probes sur tous les deployments |
| **PVC** | Persistance des donnees MongoDB et des fichiers uploades (images) |
| **Namespace dedie** | Tous les manifests sont dans le namespace `flopachat` |
| **Image versioning** | Tags versionnnes (`:v1.0`) au lieu de `:latest` |

## Technologies et patterns

- Docker multi-stage build (front)
- `.dockerignore` pour optimiser les images
- Kubernetes Secrets pour les credentials
- PersistentVolumeClaim pour MongoDB et les fichiers statiques
- Ingress path-based routing (single host)
- NetworkPolicy pour isoler MongoDB
- Health checks (liveness + readiness probes)
- initContainers (attente de MongoDB)
- Namespace Kubernetes dedie
- Proxy inter-services via axios

## Commandes utiles

```sh
# Verifier l'etat des pods
kubectl get pods -n flopachat

# Voir les logs d'un pod
kubectl logs <pod-name> -n flopachat

# Verifier les services
kubectl get svc -n flopachat

# Verifier l'ingress
kubectl get ingress -n flopachat

# Arreter tous les pods (sans supprimer les donnees)
./stop.sh

# Supprimer tout (namespace, images Docker, donnees)
./cleanup.sh
```

## Structure du projet

```
├── deploy.sh                  # Script de deploiement
├── build-images.sh            # Script de build des images
├── stop.sh                    # Arret des pods (donnees conservees)
├── cleanup.sh                 # Suppression complete (namespace + images)
├── k8s/                       # Manifests Kubernetes
│   ├── namespace.yml          # Namespace flopachat
│   ├── k8s-secrets.yml        # Secrets (credentials, mode dev/test)
│   ├── network-policy.yml     # NetworkPolicy MongoDB
│   ├── mongo-pvc.yml          # PVC pour MongoDB
│   ├── server-pvc.yml         # PVC pour fichiers uploades
│   ├── mongo-deployment.yml   # Deployment MongoDB (avec probes + resources)
│   ├── mongo-service.yml      # Service MongoDB
│   ├── server-deployment.yml  # Deployment serveur principal
│   ├── server-service.yml     # Service serveur principal
│   ├── stats-deployment.yml   # Deployment stats-service
│   ├── stats-service.yml      # Service stats-service
│   ├── front-deployment.yml   # Deployment frontend
│   ├── front-service.yml      # Service frontend
│   └── ingress.yml            # Ingress (routage path-based)
├── front/                     # Application Vue.js
├── server/                    # API Express.js principale
└── stats-service/             # Microservice statistiques
```
