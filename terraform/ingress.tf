# Generate a self-signed TLS certificate for marketplace.local
resource "tls_private_key" "ingress" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "ingress" {
  private_key_pem = tls_private_key.ingress.private_key_pem

  subject {
    common_name  = "marketplace.local"
    organization = "flopachat"
  }

  validity_period_hours = 8760 # 1 year
  dns_names             = ["marketplace.local"]

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

# TLS Secret using the generated certificate
resource "kubernetes_secret" "tls_secret" {
  metadata {
    name      = "tls-secret"
    namespace = kubernetes_namespace.flopachat.metadata[0].name
  }
  type = "kubernetes.io/tls"
  data = {
    "tls.crt" = tls_self_signed_cert.ingress.cert_pem
    "tls.key" = tls_private_key.ingress.private_key_pem
  }
}

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
