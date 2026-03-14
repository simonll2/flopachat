# Kubernetes Ingress — equivalent of k8s/ingress.yml
resource "kubernetes_ingress_v1" "app_ingress" {
  metadata {
    name      = "app-ingress"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
    annotations = {
      "nginx.ingress.kubernetes.io/ssl-redirect"   = "false"
      "nginx.ingress.kubernetes.io/proxy-body-size" = "10m"
    }
  }

  spec {
    ingress_class_name = "nginx"

    tls {
      hosts       = ["marketplace.local"]
      secret_name = "tls-secret"
    }

    rule {
      host = "marketplace.local"
      http {
        path {
          path      = "/api"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.server.metadata[0].name
              port {
                number = 5000
              }
            }
          }
        }
        path {
          path      = "/static"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.server.metadata[0].name
              port {
                number = 5000
              }
            }
          }
        }
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.front.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
