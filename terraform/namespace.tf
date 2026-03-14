resource "kubernetes_namespace" "flopachat" {
  metadata {
    name = var.namespace
    labels = {
      app     = "flopachat"
      managed = "terraform"
    }
  }
}
