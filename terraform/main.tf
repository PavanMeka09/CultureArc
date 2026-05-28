terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04
  instance_type = "t3.medium"
  key_name      = "culturearc-key"

  user_data = <<-EOF
    #!/bin/bash
    apt update -y
    apt install -y docker.io curl

    systemctl enable docker
    systemctl start docker

    curl -sfL https://get.k3s.io | sh -
  EOF

  tags = {
    Name = "culturearc-server"
  }
}

output "public_ip" {
  value = aws_instance.server.public_ip
}