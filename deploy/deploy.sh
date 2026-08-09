#!/usr/bin/env bash
# Zero-downtime deploy for grabitui.
#
#   sudo /opt/grabitui/deploy.sh s3://gradient-deploy-676591241313/grabitui/<tarball>
#
# Same shape as omegaservice/deploy/deploy.sh: the new build starts on
# whichever slot is idle and has to answer /api/health before nginx is
# flipped to it. Until that flip the old slot keeps serving every request,
# so a build that fails to boot changes nothing for users. The old slot is
# stopped only after the flip, its files left on disk so rollback.sh can
# bring it straight back.
set -euo pipefail

ARTIFACT_S3="${1:?usage: deploy.sh s3://bucket/key.tar.gz}"
UPSTREAM=/etc/nginx/conf.d/grabitui-upstream.conf
ENV_DIR=/opt/grabitui/env
SHARED_ENV=/opt/grabitui/shared/.env.production
RETRIES=40
SLEEP=3

active_port=$(grep -oE '127\.0\.0\.1:[0-9]+' "$UPSTREAM" | cut -d: -f2)
if [ "$active_port" = "3004" ]; then
  active=blue;  target=green; target_port=3005
else
  active=green; target=blue;  target_port=3004
fi
echo "active=$active($active_port)  ->  target=$target($target_port)"

# Refresh the shared secrets file from Parameter Store on every deploy so a
# rotation takes effect on the next deploy without a separate manual step.
internal_secret=$(aws ssm get-parameter --name /grabit/internal_secret --with-decryption --region ap-south-1 --query Parameter.Value --output text)
sentry_dsn=$(aws ssm get-parameter --name /monitoring/dsn/grabit-web --with-decryption --region ap-south-1 --query Parameter.Value --output text)

install -d -o appuser -g appuser /opt/grabitui/shared
{
  echo "NEXT_PUBLIC_API_URL=https://api.grabit365.com"
  echo "NEXT_PUBLIC_CASHFREE_ENV=production"
  echo "INTERNAL_SECRET=$internal_secret"
  echo "NEXT_PUBLIC_SENTRY_DSN=$sentry_dsn"
} > "$SHARED_ENV"
chown appuser:appuser "$SHARED_ENV"
chmod 600 "$SHARED_ENV"

rm -rf "/opt/grabitui/$target"
install -d -o appuser -g appuser "/opt/grabitui/$target"
aws s3 cp "$ARTIFACT_S3" "/tmp/grabitui-deploy.tar.gz" --region ap-south-1 --quiet
tar -xzf /tmp/grabitui-deploy.tar.gz -C "/opt/grabitui/$target"
rm -f /tmp/grabitui-deploy.tar.gz
chown -R appuser:appuser "/opt/grabitui/$target"

systemctl restart "grabitui@$target"

ok=0
for _ in $(seq 1 $RETRIES); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$target_port/api/health" || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep $SLEEP
done

if [ "$ok" != "1" ]; then
  echo "FAILED: $target never became healthy. $active($active_port) is still serving traffic; nothing changed."
  systemctl stop "grabitui@$target" || true
  exit 1
fi
echo "$target healthy on $target_port"

printf 'upstream grabitui_active { server 127.0.0.1:%s; }\n' "$target_port" > "$UPSTREAM"
nginx -t
systemctl reload nginx
echo "flipped to $target($target_port)"

sleep 5
systemctl stop "grabitui@$active" || true
systemctl disable "grabitui@$active" >/dev/null 2>&1 || true
systemctl enable "grabitui@$target" >/dev/null 2>&1 || true

echo "DEPLOY_OK  now=$target($target_port)  previous=$active (files kept for rollback)"
