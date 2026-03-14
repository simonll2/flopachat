terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }
}

# Provider configuration for Minikube
# Uses the current kubectl context by default
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}
