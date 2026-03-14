resource "kubernetes_service" "mongo" {
  metadata {
    name      = "mongo"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    selector = {
      app = "mongo"
    }
    port {
      port        = 27017
      target_port = 27017
    }
    type = "ClusterIP"
  }
}

resource "kubernetes_service" "server" {
  metadata {
    name      = "server-service"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    selector = {
      app = "server"
    }
    port {
      port        = 5000
      target_port = 5000
    }
    type = "ClusterIP"
  }
}

resource "kubernetes_service" "stats" {
  metadata {
    name      = "stats-service"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    selector = {
      app = "stats-service"
    }
    port {
      port        = 4000
      target_port = 4000
    }
    type = "ClusterIP"
  }
}

resource "kubernetes_service" "front" {
  metadata {
    name      = "front-service"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  spec {
    selector = {
      app = "front"
    }
    port {
      port        = 80
      target_port = 80
    }
    type = "ClusterIP"
  }
}
