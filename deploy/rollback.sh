#!/usr/bin/env bash
# Flip back to whichever slot isn't currently active. Same shape as
# omegaservice/deploy/rollback.sh. Assumes the previous slot's files and
# systemd unit are still present (deploy.sh only stops, never deletes).
set -euo pipefail

UPSTREAM=/etc/nginx/conf.d/grabitui-upstream.conf

active_port=$(grep -oE '127\.0\.0\.1:[0-9]+' "$UPSTREAM" | cut -d: -f2)
if [ "$active_port" = "3004" ]; then
  active=blue;  previous=green; previous_port=3005
else
  active=green; previous=blue;  previous_port=3004
fi

if [ ! -f "/opt/grabitui/$previous/server.js" ]; then
  echo "FAILED: no previous build found on $previous slot"
  exit 1
fi

systemctl start "grabitui@$previous"

ok=0
for _ in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$previous_port/api/health" || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 3
done

if [ "$ok" != "1" ]; then
  echo "FAILED: $previous never became healthy, aborting rollback"
  systemctl stop "grabitui@$previous" || true
  exit 1
fi

printf 'upstream grabitui_active { server 127.0.0.1:%s; }\n' "$previous_port" > "$UPSTREAM"
nginx -t
systemctl reload nginx
sleep 5
systemctl stop "grabitui@$active" || true
systemctl disable "grabitui@$active" >/dev/null 2>&1 || true
systemctl enable "grabitui@$previous" >/dev/null 2>&1 || true

echo "ROLLED_BACK  now=$previous($previous_port)  previous=$active"
