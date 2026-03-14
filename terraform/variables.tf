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

# Sensitive variables — pass via terraform.tfvars or TF_VAR_ environment variables
variable "mongo_uri" {
  description = "MongoDB connection URI"
  type        = string
  default     = "mongodb://mongo:27017/flopachat"
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  default     = "change-me-in-production"
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key (test mode)"
  type        = string
  default     = "change-me-in-production"
  sensitive   = true
}
