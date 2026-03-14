# Rapport de projet — Intégration Cloud

## Flopachat : Application E-Commerce sur Kubernetes

**Cours** : Intégration Cloud
**Groupe** : 7
**Date** : Mars 2026

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Présentation de l'application](#2-présentation-de-lapplication)
3. [Architecture microservices](#3-architecture-microservices)
4. [Conteneurisation Docker](#4-conteneurisation-docker)
5. [Orchestration Kubernetes](#5-orchestration-kubernetes)
6. [Sécurisation du cluster](#6-sécurisation-du-cluster)
7. [Infrastructure as Code — Terraform](#7-infrastructure-as-code--terraform)
8. [Docker Compose — Environnement de développement](#8-docker-compose--environnement-de-développement)
9. [Gestion des secrets](#9-gestion-des-secrets)
10. [Technologies utilisées](#10-technologies-utilisées)
11. [Guide de déploiement](#11-guide-de-déploiement)
12. [Conclusion](#12-conclusion)

---

## 1. Introduction

Ce projet consiste en la conception et le déploiement d'une application e-commerce complète sur un cluster Kubernetes. L'objectif est de démontrer la maîtrise de l'intégration cloud à travers l'utilisation de multiples technologies : web services, conteneurisation Docker, orchestration Kubernetes, Infrastructure as Code (Terraform), et sécurisation du cluster.

L'application choisie, **Flopachat**, est une marketplace d'électronique qui permet aux utilisateurs de consulter un catalogue de produits, gérer un panier, passer des commandes et effectuer des paiements via Stripe. Un espace d'administration offre la gestion des produits, utilisateurs, commandes et un tableau de bord statistique.

---

## 2. Présentation de l'application

### 2.1 Fonctionnalités utilisateur

- **Inscription et connexion** : création de compte avec photo de profil, authentification JWT
- **Catalogue produits** : liste des produits, page de détail, système de votes (thumbs up/down)
- **Panier** : ajout, modification des quantités, suppression d'articles
- **Commandes** : passage de commande, historique, suivi de statut (en attente → confirmée → livrée)
- **Paiement** : intégration Stripe en mode test (carte `4242 4242 4242 4242`)
- **Profil** : modification des informations personnelles et de la photo

> *Capture 1 : Page d'accueil avec le catalogue de produits*

> *Capture 2 : Page de détail d'un produit avec le système de votes*

> *Capture 3 : Panier avec plusieurs articles*

> *Capture 4 : Page de paiement Stripe*

> *Capture 5 : Historique des commandes avec les différents statuts*

### 2.2 Fonctionnalités d'administration

- **Dashboard** : vue d'ensemble avec indicateurs clés (nombre de clients, produits, commandes, votes)
- **Gestion des produits** : création, modification, suppression avec upload d'images
- **Gestion des utilisateurs** : liste, suppression
- **Gestion des commandes** : liste complète, modification du statut
- **Statistiques avancées** : chiffre d'affaires, stats mensuelles, top produits, répartition par statut

> *Capture 6 : Dashboard admin avec les indicateurs clés*

> *Capture 7 : Page de statistiques avec le graphique mensuel (Chart.js)*

> *Capture 8 : Liste des produits côté admin avec les actions CRUD*

### 2.3 Données de démonstration

L'application est livrée avec un jeu de données pré-chargé au premier démarrage (seed automatique) :
- 1 compte admin (`admin@admin.com` / `admin`)
- 11 comptes utilisateurs avec adresses réalistes
- 12 produits électroniques avec images
- Commandes générées aléatoirement pour chaque utilisateur (5 à 15 commandes avec statuts variés)

Ce seed permet de tester immédiatement toutes les fonctionnalités, y compris les statistiques qui nécessitent un volume de données suffisant.

---

## 3. Architecture microservices

L'application est découpée en **2 backends indépendants** et **1 frontend** :

```
┌──────────────────────────────────────────────────────────────────────┐
│                Kubernetes Cluster (namespace: flopachat)             │
│                                                                      │
│  ┌──────────┐    ┌──────────────┐   ┌────────────────┐              │
│  │  Front   │    │   Server     │   │ Stats Service  │              │
│  │ (Vue.js) │    │  (Express)   │──▶│  (Express)     │              │
│  │  :80     │    │   :5000      │   │   :4000        │              │
│  └────┬─────┘    └──────┬───────┘   └───────┬────────┘              │
│       │                 │                    │                        │
│       │                 └────────┬───────────┘                       │
│       │                         ▼                                    │
│       │               ┌──────────────┐                               │
│       │               │   MongoDB    │                               │
│       │               │   :27017     │                               │
│       │               └──────────────┘                               │
│  ─────┴────────────────────────────────────────────────────────────  │
│              Nginx Ingress Controller (TLS/HTTPS)                    │
│        marketplace.local/     → front                                │
│        marketplace.local/api  → server                               │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.1 Server — API principale (port 5000)

Service Express.js gérant la logique métier :

| Domaine | Endpoints | Sécurité |
|---------|-----------|----------|
| Authentification | `POST /register`, `POST /login`, `POST /validate-token` | Public |
| Utilisateurs | `GET/PUT /users/:id`, `GET/DELETE /admin/users` | JWT / JWT + admin |
| Produits | `GET/POST/PUT/DELETE /products`, `PATCH /products/:id/thumbs` | Public / JWT + admin |
| Panier | `GET/POST/PUT/DELETE /cart` | JWT |
| Commandes | `GET/POST /orders`, `PATCH /admin/orders/:id/status` | JWT / JWT + admin |
| Paiement | `POST /create-checkout-session` | JWT |

Le serveur agit également comme **proxy** pour les requêtes `/api/stats/*`, les transmettant au stats-service via HTTP interne. Ce pattern démontre la **communication inter-services** au sein du cluster Kubernetes.

### 3.2 Stats Service — Microservice statistiques (port 4000)

Service Express.js dédié aux statistiques, avec des **pipelines d'agrégation MongoDB avancés** :

| Endpoint | Opérateurs MongoDB utilisés | Description |
|----------|----------------------------|-------------|
| `GET /stats` | `$match`, `$group` | CA total et nombre de commandes livrées |
| `GET /stats/summary` | `$match`, `$group`, `$facet` | Résumé enrichi : CA, panier moyen, répartition par statut |
| `GET /stats/monthly` | `$match`, `$group`, `$dateToString`, `$sort` | CA et commandes par mois (12 derniers mois) |
| `GET /stats/top-products` | `$unwind`, `$group`, `$lookup`, `$sort`, `$limit`, `$project` | Top 5 produits les plus vendus |

Ce découpage en microservice dédié permet de :
- **Isoler** la charge des requêtes d'agrégation complexes
- **Scaler** indépendamment le service de statistiques
- **Démontrer** la communication inter-services via le proxy HTTP

### 3.3 Frontend (port 80)

Application Vue.js 3 single-page avec :
- **Vue Router** : navigation client-side avec routes protégées
- **Vuex** : gestion d'état centralisée (modules auth, cart, order, product)
- **Bootstrap 5** : interface responsive
- **Chart.js** : graphiques dans le dashboard admin
- **Stripe.js** : intégration du formulaire de paiement

Le frontend est servi par **nginx** (via un multi-stage build Docker) et communique avec le backend via des URLs relatives (`/api/...`), routées par l'Ingress Kubernetes.

### 3.4 Communication inter-services

```
Navigateur → Ingress (/api/stats/*) → Server (proxy) → Stats Service → MongoDB
Navigateur → Ingress (/api/*)       → Server         → MongoDB
Navigateur → Ingress (/)            → Front (nginx)
```

Le serveur principal transmet les requêtes statistiques au stats-service via **axios** en utilisant la résolution DNS interne de Kubernetes (`http://stats-service:4000`). L'en-tête `Authorization` est propagé pour maintenir l'authentification.

> *Capture 9 : Logs du server montrant le proxy vers stats-service (`kubectl logs <server-pod> -n flopachat`)*

---

## 4. Conteneurisation Docker

### 4.1 Stratégie de build

Chaque composant possède son propre **Dockerfile** :

| Service | Image de base | Taille optimisée | Technique |
|---------|--------------|------------------|-----------|
| server | `node:18-alpine` | Oui | `--production`, `.dockerignore` |
| stats-service | `node:18-alpine` | Oui | `--production`, `.dockerignore` |
| front | `node:18-alpine` → `nginx:stable-alpine` | Oui | **Multi-stage build** |

### 4.2 Multi-stage build du frontend

Le Dockerfile du frontend utilise un **build en 2 étapes** :

```dockerfile
# Étape 1 : Build de l'application Vue.js
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Servir avec nginx (image finale légère)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Avantages :
- L'image finale ne contient que les fichiers statiques compilés et nginx
- Pas de `node_modules` ni de code source dans l'image de production
- Taille d'image réduite (nginx:alpine ≈ 40 Mo vs node:alpine ≈ 180 Mo)

### 4.3 Publication sur Docker Hub

Les 3 images sont publiées sur Docker Hub avec des tags versionnés :
- `devbsamy/server:v1.0`
- `devbsamy/front:v1.0`
- `devbsamy/stats-service:v1.0`

L'utilisation de tags versionnés (`:v1.0`) au lieu de `:latest` garantit la reproductibilité des déploiements.

> *Capture 10 : `docker images | grep devbsamy` montrant les 3 images buildées*

> *Capture 11 : Page Docker Hub montrant les images publiées*

---

## 5. Orchestration Kubernetes

Le cluster Kubernetes est déployé sur **Minikube** et contient **18 manifestes YAML** dans le dossier `k8s/`.

### 5.1 Namespace

Toutes les ressources sont isolées dans le namespace `flopachat`, séparant l'application des autres workloads du cluster.

### 5.2 Deployments

4 deployments sont configurés avec les bonnes pratiques suivantes :

| Deployment | Image | Réplicas | Probes | Resources | Init Container |
|------------|-------|----------|--------|-----------|----------------|
| mongo | `mongo:7` | 1 | readiness + liveness (mongosh ping) | 100m-500m CPU, 256Mi-512Mi | — |
| server | `devbsamy/server:v1.0` | 1 (HPA 1-5) | readiness + liveness (HTTP /health) | 100m-250m CPU, 128Mi-256Mi | wait-for-mongo |
| stats-service | `devbsamy/stats-service:v1.0` | 1 | readiness + liveness (HTTP /health) | 100m-250m CPU, 128Mi-256Mi | wait-for-mongo |
| front | `devbsamy/front:v1.0` | 1 (HPA 1-3) | readiness + liveness (HTTP /) | 50m-100m CPU, 64Mi-128Mi | — |

**Health checks** : chaque deployment possède des readiness et liveness probes. La readiness probe détermine quand le pod est prêt à recevoir du trafic, la liveness probe redémarre le pod s'il ne répond plus.

**Init containers** : les services dépendant de MongoDB (server, stats-service) utilisent un init container `busybox` qui attend que MongoDB soit accessible (`nc -z mongo 27017`) avant de démarrer le conteneur principal.

**Resource requests/limits** : chaque conteneur déclare ses besoins en CPU et mémoire, permettant au scheduler Kubernetes d'optimiser le placement des pods.

> *Capture 12 : `kubectl get pods -n flopachat` montrant tous les pods en Running/Ready*

> *Capture 13 : `kubectl describe deployment server -n flopachat` montrant les probes, resources et init containers*

### 5.3 Services

4 services ClusterIP exposent les pods en interne :

| Service | Port | Cible |
|---------|------|-------|
| mongo | 27017 | MongoDB |
| server-service | 5000 | API principale |
| stats-service | 4000 | Microservice stats |
| front-service | 80 | Frontend nginx |

> *Capture 14 : `kubectl get svc -n flopachat` montrant les 4 services*

### 5.4 Ingress (Gateway)

L'Ingress Nginx assure le **routage path-based** depuis un point d'entrée unique :

| Chemin | Backend | Description |
|--------|---------|-------------|
| `/api` | server-service:5000 | API REST |
| `/static` | server-service:5000 | Images uploadées |
| `/` | front-service:80 | Application Vue.js |

L'Ingress est configuré avec **TLS** (certificat auto-signé) permettant l'accès en HTTPS.

> *Capture 15 : `kubectl get ingress -n flopachat` montrant l'ingress avec l'adresse et les règles*

### 5.5 Persistance (PVC)

2 PersistentVolumeClaims assurent la persistance des données :

| PVC | Taille | Usage |
|-----|--------|-------|
| mongo-pvc | 1 Gi | Données MongoDB (`/data/db`) |
| server-static-pvc | 500 Mi | Images uploadées (`/app/static`) |

Les données survivent aux redémarrages des pods grâce aux PVC.

> *Capture 16 : `kubectl get pvc -n flopachat` montrant les 2 PVC en état Bound*

### 5.6 Scaling automatique (HPA)

Des `HorizontalPodAutoscaler` permettent le scaling automatique en fonction de la charge :

| HPA | Deployment | Min | Max | Métrique CPU | Métrique mémoire |
|-----|-----------|-----|-----|-------------|-----------------|
| server-hpa | server | 1 | 5 | 70% | 80% |
| front-hpa | front | 1 | 3 | 70% | — |

Le HPA nécessite le **metrics-server** de Minikube (`minikube addons enable metrics-server`).

> *Capture 17 : `kubectl get hpa -n flopachat` montrant les autoscalers et leurs métriques*

---

## 6. Sécurisation du cluster

### 6.1 NetworkPolicy — Segmentation réseau

Le cluster applique une politique de **deny-all par défaut** puis autorise explicitement chaque flux :

```
                    ┌─────────────────────────┐
                    │   default-deny-all      │
                    │   (bloque tout trafic    │
                    │    entrant par défaut)   │
                    └─────────────────────────┘

  allow-front-ingress      allow-server-ingress      allow-stats-from-server
  ┌──────────────┐         ┌──────────────┐          ┌──────────────────┐
  │ * → front:80 │         │ * → server   │          │ server → stats   │
  │              │         │     :5000    │          │          :4000   │
  └──────────────┘         └──────────────┘          └──────────────────┘

                         allow-mongo-access
                    ┌──────────────────────────┐
                    │ server + stats → mongo   │
                    │                 :27017   │
                    └──────────────────────────┘
```

5 NetworkPolicies au total :
1. **default-deny-all** : bloque tout trafic entrant dans le namespace
2. **allow-front-ingress** : autorise le trafic vers le frontend (port 80)
3. **allow-server-ingress** : autorise le trafic vers le server (port 5000)
4. **allow-stats-from-server** : autorise **uniquement** le server à contacter le stats-service (port 4000)
5. **allow-mongo-access** : autorise **uniquement** le server et le stats-service à accéder à MongoDB (port 27017)

Ainsi, le frontend ne peut pas accéder directement à MongoDB ni au stats-service.

> *Capture 18 : `kubectl get networkpolicy -n flopachat` montrant les 5 policies*

> *Capture 19 : `kubectl describe networkpolicy allow-mongo-access -n flopachat` montrant les règles détaillées*

### 6.2 RBAC — Contrôle d'accès

Un **ServiceAccount** dédié est créé pour les pods de l'application, avec un **Role** appliquant le principe du moindre privilège :

| Ressource | Verbes autorisés |
|-----------|-----------------|
| configmaps, secrets | get, list |
| pods | get, list |
| services | get, list |

Un **RoleBinding** lie le ServiceAccount au Role. Les 3 deployments applicatifs (server, stats-service, front) utilisent ce ServiceAccount au lieu du ServiceAccount par défaut.

> *Capture 20 : `kubectl get sa,role,rolebinding -n flopachat` montrant les ressources RBAC*

### 6.3 Kubernetes Secrets et ConfigMap

La configuration est séparée entre données **sensibles** et **non-sensibles** :

| Ressource | Contenu | Usage |
|-----------|---------|-------|
| **Secret** `app-secrets` | MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY | Injecté via `envFrom: secretRef` |
| **Secret** `tls-secret` | Certificat TLS + clé privée | Utilisé par l'Ingress pour HTTPS |
| **ConfigMap** `app-config` | CORS_ORIGIN, STATS_SERVICE_URL, NODE_ENV, MONGO_DB_NAME | Injecté via `envFrom: configMapRef` |

Cette séparation permet de modifier la configuration non-sensible sans toucher aux secrets.

### 6.4 ResourceQuota et LimitRange

| Ressource | Rôle |
|-----------|------|
| **ResourceQuota** | Limite globale du namespace : max 2 CPU demandés, 4 CPU en limite, 2 Gi RAM demandés, 4 Gi RAM en limite, 20 pods max, 5 PVC max |
| **LimitRange** | Valeurs par défaut par conteneur : 250m CPU et 256 Mi RAM en limite, 100m CPU et 128 Mi RAM en request |

Le ResourceQuota empêche un déploiement accidentel de consommer toutes les ressources du cluster. Le LimitRange applique des valeurs par défaut aux conteneurs qui n'en spécifient pas.

> *Capture 21 : `kubectl get resourcequota -n flopachat` montrant les quotas et leur utilisation*

### 6.5 Autres mesures de sécurité

| Mesure | Description |
|--------|-------------|
| **CORS restreint** | L'API n'accepte que les requêtes provenant de `http://marketplace.local` |
| **JWT** | Authentification par token avec expiration de 24h, algorithme HS256 |
| **Bcrypt** | Hashing des mots de passe (salt rounds) |
| **Image versioning** | Tags versionnés (`:v1.0`) au lieu de `:latest` pour la reproductibilité |
| **Namespace dédié** | Isolation logique de toutes les ressources |

---

## 7. Infrastructure as Code — Terraform

L'ensemble de l'infrastructure Kubernetes est reproductible via **Terraform** avec le provider `hashicorp/kubernetes`.

### 7.1 Organisation des fichiers

```
terraform/
├── main.tf           # Provider Kubernetes (contexte Minikube)
├── variables.tf      # Variables paramétrables (images, stockage, secrets)
├── namespace.tf      # Namespace flopachat
├── storage.tf        # PVC (MongoDB + fichiers statiques)
├── deployments.tf    # 4 deployments avec probes et resources
├── services.tf       # 4 services ClusterIP
├── security.tf       # Secrets, ConfigMap, RBAC, NetworkPolicies, Quotas
├── ingress.tf        # TLS Secret + Ingress
├── hpa.tf            # HorizontalPodAutoscaler
├── outputs.tf        # Outputs de vérification
└── certs/            # Certificats TLS auto-signés
```

### 7.2 Variables et paramétrisation

Les images Docker, les tailles de stockage et les secrets sont paramétrables via des variables Terraform :

```hcl
variable "server_image" {
  default = "devbsamy/server:v1.0"
}

variable "stripe_secret_key_b64" {
  sensitive = true    # Masqué dans les logs et le plan
  default   = "..."   # Encodé en base64
}
```

Les secrets sont stockés en **base64** dans les valeurs par défaut (même format que les Kubernetes Secrets YAML) et décodés au runtime :

```hcl
data = {
  STRIPE_SECRET_KEY = base64decode(var.stripe_secret_key_b64)
}
```

### 7.3 Ressources créées

Un `terraform apply` crée **toutes** les ressources en une seule commande :

| Catégorie | Ressources |
|-----------|-----------|
| Namespace | flopachat |
| Stockage | 2 PVC (mongo, server-static) |
| Deployments | 4 (mongo, server, stats-service, front) |
| Services | 4 (mongo, server-service, stats-service, front-service) |
| Ingress | 1 (TLS + path-based routing) |
| Sécurité | 2 Secrets, 1 ConfigMap, 1 ServiceAccount, 1 Role, 1 RoleBinding |
| Réseau | 5 NetworkPolicies |
| Quotas | 1 ResourceQuota, 1 LimitRange |
| Autoscaling | 2 HPA |

### 7.4 Déploiement

```sh
cd terraform
terraform init       # Télécharge le provider Kubernetes
terraform plan       # Aperçu des 25+ ressources à créer
terraform apply      # Déploie toute l'infrastructure
```

> *Capture 22 : `terraform plan` montrant le nombre de ressources à créer*

> *Capture 23 : `terraform apply` montrant la création des ressources*

> *Capture 24 : `terraform output` montrant les outputs (namespace, services, deployments)*

---

## 8. Docker Compose — Environnement de développement

Un fichier `docker-compose.yml` permet de lancer l'application sans Kubernetes, pour le développement local.

### 8.1 Architecture

5 conteneurs reproduisent la même architecture que le cluster Kubernetes :

| Conteneur | Rôle | Équivalent K8s |
|-----------|------|----------------|
| mongo | Base de données | Deployment mongo |
| server | API principale | Deployment server |
| stats-service | Microservice stats | Deployment stats-service |
| front | Frontend Vue.js | Deployment front |
| **gateway** | Reverse proxy nginx | **Ingress Controller** |

Le conteneur **gateway** est un nginx qui reproduit le routage de l'Ingress :
- `/api` et `/static` → server:5000
- `/` → front:80

### 8.2 Déploiement

```sh
docker compose up --build    # Build et lance les 5 conteneurs
# Application accessible sur http://localhost:8080
docker compose down          # Arrête tout
```

> *Capture 25 : `docker compose up` montrant les 5 services qui démarrent*

---

## 9. Gestion des secrets

Les secrets de l'application sont présents dans le dépôt sous forme encodée en base64 :
- `k8s/k8s-secrets.yml` : format standard des Kubernetes Secrets
- `terraform/variables.tf` : valeurs par défaut des variables sensibles

### Pourquoi c'est acceptable dans ce contexte

| Point | Justification |
|-------|---------------|
| Le base64 n'est pas du chiffrement | C'est le **fonctionnement standard** de Kubernetes. Les `kind: Secret` utilisent le base64 par design. |
| Clé Stripe en mode test | La clé `sk_test_...` ne peut pas débiter de vrais comptes bancaires. |
| MongoDB URI interne | `mongodb://mongo:27017` pointe sur un service interne au cluster, inaccessible depuis l'extérieur. |

### Solutions pour la production

| Solution | Description |
|----------|-------------|
| **Sealed Secrets** | Chiffre les secrets avec une clé publique ; seul le cluster peut les déchiffrer |
| **HashiCorp Vault** | Gestion centralisée des secrets avec rotation automatique et audit |
| **Mozilla SOPS** | Chiffre les fichiers YAML/JSON avec AWS KMS, GCP KMS ou PGP |
| **external-secrets** | Synchronise les secrets depuis un provider externe (AWS SSM, GCP Secret Manager) |

### Mesures déjà en place

- Les variables Terraform sont marquées `sensitive = true` (masquées dans `terraform plan`)
- Le `.gitignore` exclut `terraform.tfvars`
- Un fichier `terraform.tfvars.example` sert de template sans contenir de valeurs réelles

---

## 10. Technologies utilisées

### Récapitulatif

| Catégorie | Technologies |
|-----------|-------------|
| **Web Services** | Express.js (2 services REST indépendants) |
| **Frontend** | Vue.js 3, Vuex, Vue Router, Bootstrap 5, Chart.js, Stripe.js |
| **Base de données** | MongoDB 7 (avec pipelines d'agrégation avancés) |
| **Conteneurisation** | Docker (multi-stage build, alpine, .dockerignore) |
| **Multi-conteneurs** | Docker Compose (5 conteneurs + gateway) |
| **Orchestration** | Kubernetes (Minikube) — Deployments, Services, Ingress, PVC, HPA |
| **Gateway** | Nginx Ingress Controller (TLS, path-based routing) |
| **Sécurité** | NetworkPolicy, RBAC, Secrets, ConfigMap, ResourceQuota, LimitRange, TLS |
| **Infrastructure as Code** | Terraform (provider Kubernetes, 10 fichiers .tf) |
| **Paiement** | Stripe (mode test) |
| **Authentification** | JWT (HS256, 24h), bcrypt |
| **Upload** | Multer (images produits et profils) |

### Patterns et bonnes pratiques

- **Microservices** : découpage en services indépendants avec communication HTTP
- **Proxy pattern** : le serveur principal relaye les requêtes vers le stats-service
- **Health checks** : readiness et liveness probes sur tous les deployments
- **Init containers** : attente des dépendances avant démarrage
- **Resource management** : requests/limits CPU et mémoire sur chaque conteneur
- **Autoscaling** : HPA basé sur les métriques CPU et mémoire
- **Zero-trust networking** : deny-all par défaut + allow explicite par service
- **Least privilege** : RBAC avec ServiceAccount dédié
- **Separation of concerns** : Secrets vs ConfigMap pour les données sensibles vs non-sensibles
- **Immutable infrastructure** : images versionnées, déploiement reproductible via Terraform

---

## 11. Guide de déploiement

### 3 méthodes disponibles

| Méthode | Commande | Cible | URL |
|---------|----------|-------|-----|
| **A — kubectl** | `./deploy.sh` | Minikube | `http://marketplace.local` |
| **B — Terraform** | `terraform apply` | Minikube | `http://marketplace.local` |
| **C — Docker Compose** | `docker compose up --build` | Docker local | `http://localhost:8080` |

### Prérequis communs

- Docker
- kubectl
- Minikube (méthodes A et B)
- Terraform (méthode B)

### Déploiement rapide (méthode B — Terraform)

```sh
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
eval $(minikube docker-env)
./build-images.sh

cd terraform
terraform init
terraform apply
```

### Vérification

```sh
kubectl get pods -n flopachat          # Tous les pods en Running
kubectl get svc -n flopachat           # Les 4 services
kubectl get ingress -n flopachat       # L'ingress avec l'adresse
kubectl get hpa -n flopachat           # Les autoscalers
kubectl get networkpolicy -n flopachat # Les 5 network policies
kubectl get pvc -n flopachat           # Les 2 PVC
kubectl get sa,role,rolebinding -n flopachat  # Le RBAC
kubectl get resourcequota -n flopachat        # Les quotas
```

> *Capture 26 : Application fonctionnelle dans le navigateur après déploiement*

---

## 12. Conclusion

Ce projet démontre l'intégration complète d'une application web dans un environnement cloud-native. L'application Flopachat couvre l'ensemble de la chaîne :

1. **Développement** : application e-commerce fonctionnelle avec Vue.js, Express.js et MongoDB
2. **Conteneurisation** : 3 Dockerfiles optimisés avec multi-stage build et publication sur Docker Hub
3. **Orchestration** : déploiement Kubernetes complet avec 18 manifestes (deployments, services, ingress, PVC, HPA)
4. **Sécurisation** : NetworkPolicy deny-all, RBAC, TLS, Secrets/ConfigMap, ResourceQuota
5. **Infrastructure as Code** : toute l'infrastructure reproductible via Terraform en une commande
6. **Multi-conteneurs** : Docker Compose comme alternative pour le développement local

Le projet propose **3 méthodes de déploiement** (kubectl, Terraform, Docker Compose), chacune adaptée à un usage spécifique, démontrant la polyvalence et la maîtrise des différents outils de l'écosystème cloud.

### Améliorations possibles

- Déploiement sur un cloud provider (GKE, EKS, AKS) avec Terraform
- Pipeline CI/CD (GitHub Actions) pour le build et le déploiement automatisé
- Monitoring avec Prometheus et Grafana
- Gestion des secrets avec HashiCorp Vault ou Sealed Secrets
- Service mesh (Istio) pour l'observabilité et le traffic management
