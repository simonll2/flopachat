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

## Deploiement

### 1. Demarrer Minikube

```sh
minikube start
minikube addons enable ingress
```

### 2. Construire les images Docker

```sh
# Utiliser le daemon Docker de Minikube (pour eviter de push sur un registry)
eval $(minikube docker-env)

# Construire les 3 images
./build-images.sh
```

### 3. Deployer sur Kubernetes

```sh
./deploy.sh
```

### 4. Configurer l'acces

Ajouter l'entree suivante dans `/etc/hosts` :

```
<minikube-ip> marketplace.local
```

Pour obtenir l'IP de Minikube :

```sh
minikube ip
```

### 5. Acceder a l'application

Ouvrir [http://marketplace.local](http://marketplace.local) dans le navigateur.

**Compte admin par defaut :** `admin@admin.com` / `admin`

## Fonctionnalites

- **Authentification** : inscription, connexion, gestion de profil avec photo
- **Catalogue produits** : liste, detail, recherche, systeme de votes (thumbs up/down)
- **Panier** : ajout, modification des quantites, suppression
- **Commandes** : historique, detail, suivi de statut
- **Paiement** : integration Stripe (mode test)
- **Administration** : gestion des produits, utilisateurs, commandes, tableau de bord statistiques
- **Statistiques** : microservice dedie pour le calcul du chiffre d'affaires et du nombre de commandes

## Architecture microservices

L'application est composee de 2 backends independants :

1. **server** (port 5000) : API principale gerant l'authentification, les produits, le panier, les commandes et le paiement
2. **stats-service** (port 4000) : microservice dedie aux statistiques, interrogeant directement MongoDB

Le serveur principal agit comme **proxy** pour les requetes `/api/stats/*`, les transmettant au stats-service via HTTP interne au cluster Kubernetes. Cela demontre la **communication inter-services** au sein du cluster.

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

# Supprimer le deploiement
kubectl delete namespace flopachat
```

## Structure du projet

```
├── namespace.yml              # Namespace Kubernetes
├── k8s-secrets.yml            # Secrets (credentials)
├── deploy.sh                  # Script de deploiement
├── build-images.sh            # Script de build des images
├── network-policy.yml         # NetworkPolicy MongoDB
├── mongo-pvc.yml              # PVC pour MongoDB
├── server-pvc.yml             # PVC pour fichiers uploades
├── mongo-deployment.yml       # Deployment MongoDB
├── mongo-service.yml          # Service MongoDB
├── server-deployment.yml      # Deployment serveur principal
├── server-service.yml         # Service serveur principal
├── stats-deployment.yml       # Deployment stats-service
├── stats-service.yml          # Service stats-service
├── front-deployment.yml       # Deployment frontend
├── front-service.yml          # Service frontend
├── ingress.yml                # Ingress (routage path-based)
├── front/                     # Application Vue.js
├── server/                    # API Express.js principale
└── stats-service/             # Microservice statistiques
```
