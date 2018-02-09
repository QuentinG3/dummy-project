pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'whoami'
            },
            steps {
                sh 'cat /etc/group'
            },
            steps {
                sh 'docker info'
            }
        }
    }
}
