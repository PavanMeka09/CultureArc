terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.medium" # Recommended: 2 vCPUs, 4GB RAM to run K3s, Docker, and Prometheus/Grafana smoothly
}

variable "key_name" {
  type        = string
  description = "Name of the AWS SSH key pair to access the EC2 instance"
  default     = "culturearc-key"
}

variable "ami_id" {
  type        = string
  description = "The AMI ID to use for the EC2 instance. Defaults to the official Ubuntu 22.04 LTS AMI in us-east-1."
  default     = "ami-0c7217cdde317cfec" # Standard Ubuntu 22.04 LTS AMI in us-east-1
}

# Provision the EC2 Host Instance
resource "aws_instance" "culturearc_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  # Note: Launched into the Default VPC Security Group due to IAM CreateSecurityGroup restrictions.
  # Please manually allow inbound traffic for ports 22, 80, 5000, 9090, and 3000 in your AWS EC2 Console GUI.

  # Simple User Data script to install Docker, K3s, and utilities
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io curl git
              systemctl start docker
              systemctl enable docker

              # Install lightweight Kubernetes (K3s)
              curl -sfL https://get.k3s.io | sh -
              
              # Set up correct permissions for kubectl
              mkdir -p /home/ubuntu/.kube
              cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
              chown -R ubuntu:ubuntu /home/ubuntu/.kube
              EOF

  tags = {
    Name = "culturearc-devops-server"
  }
}

# Output the Public IP so the user knows where to connect
output "public_ip" {
  value       = aws_instance.culturearc_server.public_ip
  description = "The public IP address of the CultureArc DevOps server"
}
