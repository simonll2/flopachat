# ConfigMap for non-sensitive configuration
resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "app-config"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  data = {
    CORS_ORIGIN       = "http://marketplace.local"
    STATS_SERVICE_URL = "http://stats-service:4000"
    NODE_ENV          = "production"
    MONGO_DB_NAME     = "flopachat"
  }
}

# Secrets for sensitive data (development/test only)
# In production, use Sealed Secrets, HashiCorp Vault or external-secrets
resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "app-secrets"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  type = "Opaque"
  data = {
    MONGO_URI         = var.mongo_uri
    JWT_SECRET        = var.jwt_secret
    STRIPE_SECRET_KEY = var.stripe_secret_key
  }
}

# ServiceAccount
resource "kubernetes_service_account" "flopachat_sa" {
  metadata {
    name      = "flopachat-sa"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
    labels = {
      app = "flopachat"
    }
  }
}

# Role with least privilege
resource "kubernetes_role" "flopachat_role" {
  metadata {
    name      = "flopachat-role"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
    labels = {
      app = "flopachat"
    }
  }
  rule {
    api_groups = [""]
    resources  = ["configmaps", "secrets"]
    verbs      = ["get", "list"]
  }
  rule {
    api_groups = [""]
    resources  = ["pods"]
    verbs      = ["get", "list"]
  }
  rule {
    api_groups = [""]
    resources  = ["services"]
    verbs      = ["get", "list"]
  }
}

# RoleBinding
resource "kubernetes_role_binding" "flopachat_rolebinding" {
  metadata {
    name      = "flopachat-rolebinding"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
    labels = {
      app = "flopachat"
    }
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.flopachat_role.metadata[0].name
  }
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.flopachat_sa.metadata[0].name
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
}

# ResourceQuota
resource "kubernetes_resource_quota" "flopachat_quota" {
  metadata {
    name      = "flopachat-quota"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    hard = {
      "requests.cpu"             = "2"
      "requests.memory"          = "2Gi"
      "limits.cpu"               = "4"
      "limits.memory"            = "4Gi"
      "pods"                     = "20"
      "persistentvolumeclaims"   = "5"
    }
  }
}

# LimitRange
resource "kubernetes_limit_range" "flopachat_limits" {
  metadata {
    name      = "flopachat-limits"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    limit {
      type = "Container"
      default = {
        cpu    = "250m"
        memory = "256Mi"
      }
      default_request = {
        cpu    = "100m"
        memory = "128Mi"
      }
    }
  }
}

# NetworkPolicy: Default deny all
resource "kubernetes_network_policy" "default_deny" {
  metadata {
    name      = "default-deny-all"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    pod_selector {}
    policy_types = ["Ingress"]
  }
}

# NetworkPolicy: Allow front ingress
resource "kubernetes_network_policy" "allow_front" {
  metadata {
    name      = "allow-front-ingress"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    pod_selector {
      match_labels = {
        app = "front"
      }
    }
    policy_types = ["Ingress"]
    ingress {
      ports {
        port     = "80"
        protocol = "TCP"
      }
    }
  }
}

# NetworkPolicy: Allow server ingress
resource "kubernetes_network_policy" "allow_server" {
  metadata {
    name      = "allow-server-ingress"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    pod_selector {
      match_labels = {
        app = "server"
      }
    }
    policy_types = ["Ingress"]
    ingress {
      ports {
        port     = "5000"
        protocol = "TCP"
      }
    }
  }
}

# NetworkPolicy: Allow stats only from server
resource "kubernetes_network_policy" "allow_stats" {
  metadata {
    name      = "allow-stats-from-server"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    pod_selector {
      match_labels = {
        app = "stats-service"
      }
    }
    policy_types = ["Ingress"]
    ingress {
      from {
        pod_selector {
          match_labels = {
            app = "server"
          }
        }
      }
      ports {
        port     = "4000"
        protocol = "TCP"
      }
    }
  }
}

# NetworkPolicy: Allow MongoDB only from server + stats
resource "kubernetes_network_policy" "allow_mongo" {
  metadata {
    name      = "allow-mongo-access"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    pod_selector {
      match_labels = {
        app = "mongo"
      }
    }
    policy_types = ["Ingress"]
    ingress {
      from {
        pod_selector {
          match_labels = {
            app = "server"
          }
        }
      }
      from {
        pod_selector {
          match_labels = {
            app = "stats-service"
          }
        }
      }
      ports {
        port     = "27017"
        protocol = "TCP"
      }
    }
  }
}
