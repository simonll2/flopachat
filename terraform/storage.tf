# PVC for MongoDB data persistence
resource "kubernetes_persistent_volume_claim" "mongo_pvc" {
  metadata {
    name      = "mongo-pvc"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = var.mongo_storage_size
      }
    }
  }
}

# PVC for server static/uploaded files
resource "kubernetes_persistent_volume_claim" "server_static_pvc" {
  metadata {
    name      = "server-static-pvc"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = var.server_static_storage_size
      }
    }
  }
}
