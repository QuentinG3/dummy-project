pipeline {
    agent any
    stages {
        stage('Test1') {
            steps {
                sh 'whoami'
            }
        }
        stage('Test2') {
            steps {
                sh 'cat /etc/group'
            }
        }
        stage('Test3') {
            steps {
                sh 'docker info'
            }
        }
    }
}
