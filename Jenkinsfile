// Jenkinsfile
pipeline {
    agent any

    options {
        // Pipeline writes to fixed paths (/tmp/grabitui-artifact,
        // /tmp/grabitui-sha.txt) — two overlapping builds would interleave
        // and could deploy a tarball that doesn't match the commit it was
        // built from.
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'ap-south-1'
        S3_PREFIX  = 's3://gradient-deploy-676591241313/grabitui'
        TARGET_INSTANCE_ID = 'i-0e598231ef2b348c8'
        // NEXT_PUBLIC_* vars are inlined into the client JS bundle at `npm run
        // build` time, not at runtime — must be present here, not just in
        // deploy.sh's runtime env file, or client code ships with the bare
        // literal var name and every browser fetch 404s.
        NEXT_PUBLIC_API_URL = 'https://api.grabit365.com'
        NEXT_PUBLIC_CASHFREE_ENV = 'production'
        // Not a secret despite SSM storage: the NEXT_PUBLIC_ prefix means
        // "safe to ship in the browser bundle". Value from
        // /monitoring/dsn/grabit-web.
        NEXT_PUBLIC_SENTRY_DSN = 'https://113cf401662b4ccd970a7951cbbf8b05@monitor.unifiednexgrade.com/7'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Package') {
            steps {
                sh '''
                    set -euo pipefail
                    rm -rf /tmp/grabitui-artifact
                    mkdir -p /tmp/grabitui-artifact
                    cp -r .next/standalone/. /tmp/grabitui-artifact/
                    mkdir -p /tmp/grabitui-artifact/.next
                    cp -r .next/static /tmp/grabitui-artifact/.next/static
                    cp -r public /tmp/grabitui-artifact/public
                    SHA=$(git rev-parse --short HEAD)
                    tar -czf "/tmp/grabitui-$SHA.tar.gz" -C /tmp/grabitui-artifact .
                    echo "$SHA" > /tmp/grabitui-sha.txt
                '''
            }
        }

        stage('Upload artifact') {
            steps {
                sh '''
                    set -euo pipefail
                    SHA=$(cat /tmp/grabitui-sha.txt)
                    aws s3 cp "/tmp/grabitui-$SHA.tar.gz" "$S3_PREFIX/grabitui-$SHA.tar.gz" --region "$AWS_REGION"
                '''
            }
        }

        stage('Sync deploy scripts') {
            steps {
                sh '''
                    set -euo pipefail
                    aws s3 cp deploy/deploy.sh "$S3_PREFIX/deploy.sh" --region "$AWS_REGION"
                    aws s3 cp deploy/rollback.sh "$S3_PREFIX/rollback.sh" --region "$AWS_REGION"
                    CMD_ID=$(aws ssm send-command \
                      --instance-ids "$TARGET_INSTANCE_ID" \
                      --document-name AWS-RunShellScript \
                      --parameters "commands=[\\"aws s3 cp $S3_PREFIX/deploy.sh /opt/grabitui/deploy.sh --region $AWS_REGION\\", \\"aws s3 cp $S3_PREFIX/rollback.sh /opt/grabitui/rollback.sh --region $AWS_REGION\\", \\"chmod +x /opt/grabitui/deploy.sh /opt/grabitui/rollback.sh\\"]" \
                      --region "$AWS_REGION" --query 'Command.CommandId' --output text)
                    for i in $(seq 1 15); do
                      STATUS=$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$TARGET_INSTANCE_ID" --region "$AWS_REGION" --query Status --output text 2>/dev/null || echo Pending)
                      if [ "$STATUS" = "Success" ]; then exit 0; fi
                      if [ "$STATUS" = "Failed" ]; then
                        aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$TARGET_INSTANCE_ID" --region "$AWS_REGION" --query StandardErrorContent --output text
                        exit 1
                      fi
                      sleep 5
                    done
                    exit 1
                '''
            }
        }

        stage('Deploy via SSM') {
            steps {
                sh '''
                    set -euo pipefail
                    SHA=$(cat /tmp/grabitui-sha.txt)
                    CMD_ID=$(aws ssm send-command \
                      --instance-ids "$TARGET_INSTANCE_ID" \
                      --document-name AWS-RunShellScript \
                      --parameters "commands=[\\"/opt/grabitui/deploy.sh $S3_PREFIX/grabitui-$SHA.tar.gz\\"]" \
                      --region "$AWS_REGION" --query 'Command.CommandId' --output text)
                    echo "SSM command: $CMD_ID"
                    for i in $(seq 1 30); do
                      QUERY_ERR=$(mktemp)
                      STATUS=$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$TARGET_INSTANCE_ID" --region "$AWS_REGION" --query Status --output text 2>"$QUERY_ERR") || {
                        # Right after send-command, get-command-invocation can 404 briefly (expected) --
                        # but print the real error so a persistent permissions/config problem is visible
                        # instead of silently retrying 30 times as generic "Pending".
                        echo "query error (will retry): $(cat "$QUERY_ERR")"
                        STATUS=Pending
                      }
                      rm -f "$QUERY_ERR"
                      echo "status: $STATUS"
                      if [ "$STATUS" = "Success" ]; then exit 0; fi
                      if [ "$STATUS" = "Failed" ]; then
                        echo "--- stdout ---"
                        aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$TARGET_INSTANCE_ID" --region "$AWS_REGION" --query StandardOutputContent --output text
                        echo "--- stderr ---"
                        aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$TARGET_INSTANCE_ID" --region "$AWS_REGION" --query StandardErrorContent --output text
                        exit 1
                      fi
                      sleep 10
                    done
                    echo "TIMED OUT waiting for deploy"
                    exit 1
                '''
            }
        }

        stage('Tag Release') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'grabitui-github-pat', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        set -euo pipefail
                        PKG_VERSION=$(node -p "require('./package.json').version")
                        TAG="v${PKG_VERSION}-${BUILD_NUMBER}"
                        git tag "$TAG"
                        git push "https://${GIT_USER}:${GIT_TOKEN}@github.com/KineticTechno/grabitui.git" "$TAG"
                        echo "tagged: $TAG"
                    '''
                }
            }
        }
    }
}
