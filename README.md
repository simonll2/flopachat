# Flopachat — Application E-Commerce sur Kubernetes

Application e-commerce déployée sur Kubernetes (Minikube), avec architecture microservices, persistance des données, sécurisation avancée du cluster et Infrastructure as Code (Terraform).

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
│  │ ResourceQuota: CPU 2/4, RAM 2Gi/4Gi, 20 pods max           │      │
│  │ LimitRange: default CPU 250m, RAM 256Mi per container       │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────┐    ┌──────────────┐   ┌────────────────┐               │
│  │  Front   │    │   Server     │   │ Stats Service  │               │
│  │ (Vue.js) │    │  (Express)   │─▶ │  (Express)    │               │
│  │  :80     │    │   :5000      │   │   :4000        │               │
│  │  HPA 1-3 │    │   HPA 1-5   │    │                │               │
│  └────┬─────┘    └──────┬───────┘   └───────┬────────┘               │
│       │                 │                   │                        │
│       │                 └────────┬──────────┘                        │
│       │                          ▼                                   │
│       │               ┌──────────────┐                               │
│       │               │   MongoDB    │                               │
│       │               │   :27017     │                               │
│       │               │  (+ PVC)     │                               │
│       │               └──────────────┘                               │
│       │                    ▲                                         │
│       │                    │ NetworkPolicy                           │
│       │                    │ (default-deny + allow server/stats)     │
│  ─────┴────────────────────┴─────────────                            │
│        Nginx Ingress Controller (TLS/HTTPS)                          │
│        marketplace.local/     → front                                │
│        marketplace.local/api  → server                               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Installation sur Linux natif

### 1. Installer les dépendances

```sh
# Mettre à jour les paquets
sudo apt-get update

# Docker
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Terraform (via binaire officiel — compatible toutes versions Ubuntu)
sudo apt-get install -y unzip curl
TERRAFORM_VERSION=$(curl -s https://checkpoint-api.hashicorp.com/v1/check/terraform | grep -o '"current_version":"[^"]*"' | cut -d'"' -f4)
curl -fsSL "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -o /tmp/terraform.zip
sudo unzip -o /tmp/terraform.zip -d /usr/local/bin/
rm /tmp/terraform.zip
```

Vérifier que tout est installé :

```sh
docker --version
kubectl version --client
minikube version
terraform -version
```

### 2. Démarrer Minikube

```sh
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server   # Requis pour le HPA
```

### 3. Construire les images Docker

```sh
# Connecter le Docker local au Docker de Minikube
eval $(minikube docker-env)

# Build les 3 images
cd flopachat
./build-images.sh
```

### 4. Déployer l'application

Trois méthodes de déploiement sont disponibles. Choisir **une seule** :

#### Méthode A : Terraform (Infrastructure as Code)

```sh
cd terraform
terraform init
terraform plan       # Aperçu des ressources qui seront créées
terraform apply      # Déploie toute l'infrastructure (répondre "yes")
cd ..
```

#### Méthode B : Kubernetes (kubectl)

```sh
cd flopachat
./deploy.sh
```

#### Méthode C : Docker Compose (développement local)

> Cette méthode ne nécessite **pas** Minikube. Elle lance les conteneurs directement avec Docker.

```sh
cd flopachat
docker compose up --build
```

L'application sera accessible sur [http://localhost:8080](http://localhost:8080) (pas besoin de configurer `/etc/hosts`).

L'architecture Docker Compose reproduit le même routage que Kubernetes :
- Un conteneur **gateway** (nginx reverse proxy) joue le rôle de l'Ingress
- `/api` et `/static` sont routés vers le **server**
- `/` est routé vers le **front**

Pour arrêter : `docker compose down`

> **Note :** les étapes 5 et 6 ci-dessous ne s'appliquent **pas** à Docker Compose.

### 5. Configurer l'accès (méthodes A et B uniquement)

```sh
# Ajouter marketplace.local dans /etc/hosts
echo "$(minikube ip) marketplace.local" | sudo tee -a /etc/hosts
```

### 6. Accéder à l'application

| Méthode | URL |
|---------|-----|
| A (Terraform) ou B (kubectl) | [http://marketplace.local](http://marketplace.local) |
| C (Docker Compose) | [http://localhost:8080](http://localhost:8080) |

**Compte admin par défaut :** `admin@admin.com` / `admin`

**Carte de test Stripe :** `4242 4242 4242 4242` (date et CVC quelconques)

---

## Installation sur WSL2 (Windows)

> WSL2 utilise un réseau virtuel interne. `minikube ip` retourne une IP accessible uniquement depuis WSL, pas depuis le navigateur Windows. Il faut donc utiliser `minikube tunnel` pour les méthodes A et B.

> **Docker natif dans WSL2** : cette section installe Docker Engine directement dans WSL2 (Ubuntu), sans passer par Docker Desktop. C'est l'approche recommandée pour un environnement purement Linux sans dépendance à une application Windows tierce.

### 1. Prérequis côté Windows

- **WSL2** activé avec une distribution Ubuntu (22.04 ou 24.04 recommandé)
- Aucune dépendance à Docker Desktop

### 2. Activer systemd dans WSL2

WSL2 nécessite `systemd` pour démarrer Docker automatiquement au lancement du terminal.

Dans votre terminal WSL (Ubuntu), vérifier si systemd est déjà actif :

```sh
ps -p 1 -o comm=
```

Si la commande retourne `systemd`, c'est bon. Sinon, l'activer :

```sh
# Créer ou éditer /etc/wsl.conf
sudo tee /etc/wsl.conf > /dev/null <<EOF
[boot]
systemd=true
EOF
```

Puis redémarrer WSL **depuis PowerShell ou l'invite de commandes Windows** :

```powershell
wsl --shutdown
```

Rouvrir un terminal WSL. Vérifier :

```sh
ps -p 1 -o comm=   # doit afficher "systemd"
```

### 3. Installer Docker Engine nativement dans WSL2

```sh
# Supprimer d'éventuels anciens paquets conflictuels
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Ajouter le dépôt officiel Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter votre utilisateur au groupe docker (évite d'utiliser sudo)
sudo usermod -aG docker $USER

# Activer et démarrer le service Docker (via systemd)
sudo systemctl enable docker
sudo systemctl start docker
```

> **Important :** après `usermod`, fermer et rouvrir le terminal WSL pour que le groupe `docker` soit pris en compte. Alternativement : `newgrp docker` dans le terminal courant.

### 4. Installer les dépendances dans WSL

```sh
# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Terraform (via binaire officiel — compatible toutes versions Ubuntu)
sudo apt-get install -y unzip curl
TERRAFORM_VERSION=$(curl -s https://checkpoint-api.hashicorp.com/v1/check/terraform | grep -o '"current_version":"[^"]*"' | cut -d'"' -f4)
curl -fsSL "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -o /tmp/terraform.zip
sudo unzip -o /tmp/terraform.zip -d /usr/local/bin/
rm /tmp/terraform.zip
```

Vérifier que tout est installé :

```sh
docker --version      # Docker Engine natif (ex : Docker version 27.x.x)
docker run hello-world  # Vérifie que le daemon tourne correctement
kubectl version --client
minikube version
terraform -version
```

### 5. Démarrer Minikube

```sh
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server   # Requis pour le HPA
```

### 6. Construire les images Docker

```sh
eval $(minikube docker-env)
cd flopachat
./build-images.sh
```

### 7. Déployer l'application

Trois méthodes de déploiement sont disponibles. Choisir **une seule** :

#### Méthode A : Terraform (Infrastructure as Code)

```sh
cd terraform
terraform init
terraform plan       # Aperçu des ressources qui seront créées
terraform apply      # Déploie toute l'infrastructure (répondre "yes")
cd ..
```

#### Méthode B : Manifestes Kubernetes (kubectl)

```sh
cd flopachat
./deploy.sh
```

#### Méthode C : Docker Compose (développement rapide, sans Kubernetes)

> Cette méthode ne nécessite **pas** Minikube. Elle lance les conteneurs directement avec Docker.

```sh
cd flopachat
docker compose up --build
```

L'application sera accessible sur [http://localhost:8080](http://localhost:8080) (pas besoin de configurer le fichier hosts).

Pour arrêter : `docker compose down`

> **Note :** les étapes 8 et 9 ci-dessous ne s'appliquent **pas** à Docker Compose.

### 8. Lancer le tunnel (méthodes A et B uniquement)

Dans un **second terminal WSL** (à laisser ouvert) :

```sh
minikube tunnel
```

> Cela expose les services Ingress sur `127.0.0.1` dans WSL, qui est aussi accessible depuis Windows.

### 9. Configurer l'accès (méthodes A et B uniquement)

Éditer le fichier hosts **côté Windows** (`C:\Windows\System32\drivers\etc\hosts`) en tant qu'administrateur et ajouter :

```
127.0.0.1 marketplace.local
```

> **Note :** avec `minikube tunnel`, l'IP est toujours `127.0.0.1`, pas celle retournée par `minikube ip`.

### 10. Accéder à l'application

| Méthode | URL |
|---------|-----|
| A (Terraform) ou B (kubectl) | [http://marketplace.local](http://marketplace.local) |
| C (Docker Compose) | [http://localhost:8080](http://localhost:8080) |

**Compte admin par défaut :** `admin@admin.com` / `admin`

**Carte de test Stripe :** `4242 4242 4242 4242` (date et CVC quelconques)

---

## Nettoyage

### Supprimer le déploiement Terraform (méthode A)

```sh
cd terraform
terraform destroy    # Répondre "yes"
```

### Supprimer le déploiement Kubernetes (méthode B)

```sh
./cleanup.sh
```

### Supprimer le déploiement Docker Compose (méthode C)

```sh
docker compose down -v   # -v supprime aussi les volumes
```

### Arrêter Minikube

```sh
minikube stop
```

---

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

## Gestion des secrets

Attention, même si ce n'est pas une bonne pratique, les secrets de l'application (MongoDB URI, JWT secret, clé Stripe) sont versionnés sous deux formes :

- **`k8s/k8s-secrets.yml`** : encodés en base64 (format standard des `kind: Secret` Kubernetes)
- **`terraform/variables.tf`** : encodés en base64 dans les valeurs par défaut des variables, décodés au runtime via `base64decode()`

**Justification :**

| Point | Explication |
|-------|-------------|
| Clé Stripe en mode test | La clé `sk_test_...` ne peut pas débiter de vrais comptes bancaires. |
| JWT secret arbitraire | Chaîne inventée pour le projet, pas un credential externe. |
| MongoDB URI interne | `mongodb://mongo:27017` pointe sur un service interne au cluster, inaccessible depuis l'extérieur. |

**Pour de la prod, il faudrait utiliser par exemple :**

| Solution | Description |
|----------|-------------|
| [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) | Chiffre les secrets avec une clé publique ; seul le cluster peut les déchiffrer |
| [HashiCorp Vault](https://www.vaultproject.io/) | Gestion centralisée des secrets avec rotation automatique et audit |
| [Mozilla SOPS](https://github.com/getsops/sops) | Chiffre les fichiers YAML/JSON avec AWS KMS, GCP KMS ou PGP |
| [external-secrets](https://external-secrets.io/) | Synchronise les secrets depuis un provider externe (AWS SSM, GCP Secret Manager, Vault) |

Les mesures déjà en place dans le projet pour limiter l'exposition :
- Les variables Terraform sont marquées `sensitive = true` (masquées dans les logs et le `terraform plan`)
- Le `.gitignore` exclut `terraform.tfvars` (pour personnaliser les secrets sans les versionner)
- Le fichier `terraform.tfvars.example` sert de template sans contenir de valeurs réelles

## Sécurisation du cluster

| Mesure | Description |
|--------|-------------|
| **TLS/HTTPS** | Certificat TLS auto-signé sur l'Ingress. Via Terraform : généré à la volée par le provider `hashicorp/tls` (aucune clé privée dans Git). Via kubectl : pré-inclus dans `k8s/tls-secret.yml`. En production : cert-manager + Let's Encrypt |
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
- Secrets encodés en base64 (décodés au runtime via `base64decode()`)
- Certificat TLS généré à la volée par le provider `hashicorp/tls` (aucune clé privée dans Git)
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
│   ├── ingress.tf             # Génération TLS (provider hashicorp/tls) + Ingress
│   ├── hpa.tf                 # HorizontalPodAutoscaler
│   └── outputs.tf             # Outputs Terraform
├── front/                     # Application Vue.js 3
├── server/                    # API Express.js principale
└── stats-service/             # Microservice statistiques
```
