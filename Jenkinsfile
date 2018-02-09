pipeline {
    agent any
    stages {
        stage('Test1') {
            steps {
                sh 'service docker start'
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
