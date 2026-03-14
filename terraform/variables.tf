variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "flopachat"
}

variable "mongo_image" {
  description = "Docker image for MongoDB"
  type        = string
  default     = "mongo:7"
}

variable "server_image" {
  description = "Docker image for the main server"
  type        = string
  default     = "devbsamy/server:v1.0"
}

variable "front_image" {
  description = "Docker image for the frontend"
  type        = string
  default     = "devbsamy/front:v1.0"
}

variable "stats_image" {
  description = "Docker image for the stats service"
  type        = string
  default     = "devbsamy/stats-service:v1.0"
}

variable "mongo_storage_size" {
  description = "Storage size for MongoDB PVC"
  type        = string
  default     = "1Gi"
}

variable "server_static_storage_size" {
  description = "Storage size for server static files PVC"
  type        = string
  default     = "500Mi"
}

# Sensitive variables stored as base64 (same format as k8s/k8s-secrets.yml)
# Decoded at runtime by Terraform using base64decode()
variable "mongo_uri_b64" {
  description = "MongoDB connection URI (base64 encoded)"
  type        = string
  default     = "bW9uZ29kYjovL21vbmdvOjI3MDE3L2Zsb3BhY2hhdA=="
  sensitive   = true
}

variable "jwt_secret_b64" {
  description = "JWT signing secret (base64 encoded)"
  type        = string
  default     = "anNvbndlYnRva2VuZXhwcmVzc2pzbW9uZ29kYnZ1ZWpzZ3JvdXBlN2JvdXRpcXVlZWxlY3Ryb25pcXVl"
  sensitive   = true
}

variable "stripe_secret_key_b64" {
  description = "Stripe secret key, base64 encoded (test mode)"
  type        = string
  default     = "c2tfdGVzdF81MVBLOVo3RnVPdUVLTTBKbGZ6YlRCOWlOWmtoa3RKZTE4RWRZVEprUmZqcFJCR1liaDgza2RMNkxHcU9oWnRRTWdxZUp1UkZrMDlWMmZySkVkdGtQWTVRWTAwWTB3SUVYQkI="
  sensitive   = true
}
