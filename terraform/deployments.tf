# MongoDB Deployment
resource "kubernetes_deployment" "mongo" {
  metadata {
    name      = "mongo"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "mongo"
      }
    }
    template {
      metadata {
        labels = {
          app = "mongo"
        }
      }
      spec {
        container {
          name  = "mongo"
          image = var.mongo_image
          port {
            container_port = 27017
          }
          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
          volume_mount {
            name       = "mongo-storage"
            mount_path = "/data/db"
          }
        }
        volume {
          name = "mongo-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

# Server Deployment
resource "kubernetes_deployment" "server" {
  metadata {
    name      = "server"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "server"
      }
    }
    template {
      metadata {
        labels = {
          app = "server"
        }
      }
      spec {
        service_account_name = kubernetes_service_account.flopachat_sa.metadata[0].name
        init_container {
          name    = "wait-for-mongo"
          image   = "busybox"
          command = ["sh", "-c", "until nc -z mongo 27017; do echo waiting for mongo; sleep 2; done;"]
        }
        container {
          name  = "server"
          image = var.server_image
          port {
            container_port = 5000
          }
          env_from {
            secret_ref {
              name = kubernetes_secret.app_secrets.metadata[0].name
            }
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map.app_config.metadata[0].name
            }
          }
          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }
          volume_mount {
            name       = "static-storage"
            mount_path = "/app/static"
          }
        }
        volume {
          name = "static-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.server_static_pvc.metadata[0].name
          }
        }
      }
    }
  }
  depends_on = [kubernetes_deployment.mongo]
}

# Stats Service Deployment
resource "kubernetes_deployment" "stats_service" {
  metadata {
    name      = "stats-service"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "stats-service"
      }
    }
    template {
      metadata {
        labels = {
          app = "stats-service"
        }
      }
      spec {
        service_account_name = kubernetes_service_account.flopachat_sa.metadata[0].name
        init_container {
          name    = "wait-for-mongo"
          image   = "busybox"
          command = ["sh", "-c", "until nc -z mongo 27017; do echo waiting for mongo; sleep 2; done;"]
        }
        container {
          name  = "stats-service"
          image = var.stats_image
          port {
            container_port = 4000
          }
          env_from {
            secret_ref {
              name = kubernetes_secret.app_secrets.metadata[0].name
            }
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map.app_config.metadata[0].name
            }
          }
          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }
        }
      }
    }
  }
  depends_on = [kubernetes_deployment.mongo]
}

# Frontend Deployment
resource "kubernetes_deployment" "front" {
  metadata {
    name      = "front"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "front"
      }
    }
    template {
      metadata {
        labels = {
          app = "front"
        }
      }
      spec {
        service_account_name = kubernetes_service_account.flopachat_sa.metadata[0].name
        container {
          name  = "front"
          image = var.front_image
          port {
            container_port = 80
          }
          resources {
            requests = {
              cpu    = "50m"
              memory = "64Mi"
            }
            limits = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }
        }
      }
    }
  }
}
