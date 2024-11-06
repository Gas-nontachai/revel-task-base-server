pipeline {
    agent any

    stages {

        stage('Deploy'){
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'githut_dev01', usernameVariable: 'usergit', passwordVariable: 'passgit')]) {
                        sshagent(['ssh_to_44']) {
                            sh """ 
                            ssh -tt -o StrictHostKeyChecking=no root@141.98.19.44 " 
                            cd /home/rvscs01/ttcenter/ttcenter-base-server
                            git checkout release
                            git pull 
                            npm i
                            pm2 restart ttcenter-base-server
                            "
                            """
                        }
                    }
                }
            }
        }
    }
}
