pipeline {
  agent any

  environment {
    DOCKER_IMAGE = 'ghofrane694/frontend:latest'
    DOCKER_CREDENTIALS_ID = 'docker-hub-credentials-id'
  }

  stages {
    stage('Install Dependencies') {
      steps {
        bat 'echo Installing dependencies...'
        bat 'npm ci'
      }
    }

    stage('Run Unit Tests') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
          script {
            def hasUnitTests = bat(script: 'dir /s /b *.test.js', returnStatus: true) == 0
            if (hasUnitTests) {
              bat 'echo Running unit tests...'
              bat 'cmd /c "npm run test:unit || echo Unit tests failed (but continued)"'
            } else {
              echo 'No unit test files found. Skipping unit tests.'
            }
          }
        }
      }
    }

    stage('Run Integration Tests') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
          script {
            def hasIntegrationTests = bat(script: 'dir /s /b *.integration.test.js', returnStatus: true) == 0
            if (hasIntegrationTests) {
              bat 'echo Running integration tests...'
              bat 'cmd /c "npm run test:integration || echo Integration tests failed (but continued)"'
            } else {
              echo 'No integration test files found. Skipping integration tests.'
            }
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          env.BUILT_IMAGE_ID = docker.build(env.DOCKER_IMAGE).id
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', env.DOCKER_CREDENTIALS_ID) {
            docker.image(env.DOCKER_IMAGE).push("latest")
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          try {
            withKubeConfig([credentialsId: 'kubeconfig', serverUrl: 'https://127.0.0.1:62537']) {
              bat 'kubectl apply -f K8s --validate=false'
            }
          } catch (Exception e) {
            error "Kubernetes deployment failed: ${e.getMessage()}"
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ Frontend pipeline completed successfully'
    }
    failure {
      echo '❌ Frontend pipeline failed'
    }
  }
}