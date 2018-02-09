pipeline {
    agent {
        docker {
          image 'node:8-alpine',
          args '-u root:sudo -v $HOME/workspace/myproject:/myproject'
        }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
            }
        }
    }
}
