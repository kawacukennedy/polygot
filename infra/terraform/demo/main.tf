provider "google" {
  project = var.project
  region  = var.region
}

resource "google_container_cluster" "example" {
  name               = "polyglot-demo"
  location           = var.region
  initial_node_count = 1

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 50
  }
}

variable "project" {
  description = "The GCP project ID."
  type        = string
}

variable "region" {
  description = "The GCP region for the cluster."
  type        = string
  default     = "us-central1"
}
