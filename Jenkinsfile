pipeline {
    agent any

    environment {
        // REPLACE with your actual Docker Hub username
        DOCKER_USER       = 'pavanmeka09'
        
        // Jenkins Credentials ID containing your Docker Hub login/password
        DOCKER_HUB_CREDS  = 'docker-hub-credentials'
        
        BACKEND_IMAGE     = 'culturearc-backend'
        FRONTEND_IMAGE    = 'culturearc-frontend'
    }

    stages {

        stage('Docker Build') {
            steps {
                echo 'Building production Docker images...'
                sh "docker build -t ${DOCKER_USER}/${BACKEND_IMAGE}:latest ./CultureArc-backend"
                sh "docker build -t ${DOCKER_USER}/${FRONTEND_IMAGE}:latest ./CultureArc-frontend"
            }
        }

        stage('Docker Push') {
            steps {
                echo 'Authenticating and pushing to Docker Hub...'
                // Uses Jenkins credentials plugin to securely bind login credentials
                withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CREDS, usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo ${PASS} | docker login -u ${USER} --password-stdin"
                    
                    sh "docker push ${DOCKER_USER}/${BACKEND_IMAGE}:latest"
                    sh "docker push ${DOCKER_USER}/${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                echo 'Applying configurations on K3s Kubernetes...'
                // Dynamically update the placeholder in deployment.yaml to your Docker Hub username
                sh "sed -i 's|your-dockerhub-username|${DOCKER_USER}|g' k8s/deployment.yaml"
                
                // Deploying to Kubernetes using standard kubectl
                sh "kubectl apply -f k8s/deployment.yaml"
                
                echo 'Triggering rollout restart to pull new images...'
                sh "kubectl rollout restart deployment/culturearc-backend"
                sh "kubectl rollout restart deployment/culturearc-frontend"
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Cleaning workspace...'
            cleanWs()
        }
        success {
            echo 'App successfully containerized and deployed to K3s!'
        }
        failure {
            echo 'Pipeline failed. Please check build logs.'
        }
    }
}
