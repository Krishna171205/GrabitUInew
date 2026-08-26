#!/usr/bin/env bash
# Kick off the Jenkins job that builds master and deploys it, then wait for the
# result. Credentials come from SSM so nothing is pasted on a command line or
# left in shell history.
#
#   ./deploy/trigger-jenkins.sh            # grabitui
#   ./deploy/trigger-jenkins.sh OmegaWebUI # any other job on the same Jenkins
set -euo pipefail

JOB="${1:-grabitui}"
JENKINS="https://jenkins.unifiednexgrade.com"
REGION="ap-south-1"
PROFILE="${AWS_PROFILE:-gradient}"

param() {
  aws ssm get-parameter --name "$1" --with-decryption \
    --profile "$PROFILE" --region "$REGION" --query Parameter.Value --output text
}

JU="$(param /jenkins/api_user)"
JT="$(param /jenkins/api_token)"

api() { curl -sS -u "$JU:$JT" "$@"; }

before="$(api "$JENKINS/job/$JOB/api/json?tree=nextBuildNumber" | sed 's/.*"nextBuildNumber":\([0-9]*\).*/\1/')"
echo "triggering $JOB (will be build #$before)"

code="$(api -o /dev/null -w '%{http_code}' -X POST "$JENKINS/job/$JOB/build")"
[ "$code" = "201" ] || { echo "trigger failed: HTTP $code"; exit 1; }

# Jenkins queues before it allocates the build, so the first polls 404 by design.
for _ in $(seq 1 90); do
  sleep 10
  json="$(api "$JENKINS/job/$JOB/$before/api/json?tree=building,result" 2>/dev/null || true)"
  case "$json" in
    *'"building":true'*) echo "building…" ;;
    *'"result":"SUCCESS"'*) echo "SUCCESS — $JENKINS/job/$JOB/$before/"; exit 0 ;;
    *'"result":"'*) echo "FAILED — $JENKINS/job/$JOB/$before/console"; exit 1 ;;
    *) echo "queued…" ;;
  esac
done

echo "timed out waiting; check $JENKINS/job/$JOB/$before/"
exit 1
