pipeline {
    agent any
    stages {
        stage('Test1') {
            steps {
                sh 'whoami'
            }
        }
        stage('Test1') {
            steps {
                sh 'cat /etc/group'
            }
        }
        stage('Test') {
            steps {
                sh 'docker info'
            }
        }
    }
}
