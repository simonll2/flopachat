output "namespace" {
  description = "The Kubernetes namespace created"
  value       = kubernetes_namespace.flopachat.metadata[0].name
}

output "services" {
  description = "Services deployed"
  value = {
    mongo = kubernetes_service.mongo.metadata[0].name
    server = kubernetes_service.server.metadata[0].name
    stats  = kubernetes_service.stats.metadata[0].name
    front  = kubernetes_service.front.metadata[0].name
  }
}

output "deployments" {
  description = "Deployments created"
  value = {
    mongo         = kubernetes_deployment.mongo.metadata[0].name
    server        = kubernetes_deployment.server.metadata[0].name
    stats_service = kubernetes_deployment.stats_service.metadata[0].name
    front         = kubernetes_deployment.front.metadata[0].name
  }
}
