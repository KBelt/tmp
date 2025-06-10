set -e

# Create dashboards directory if it doesn't exist
mkdir -p /var/lib/grafana/dashboards

# Check if dashboards need to be copied (first run with this volume)
if [ ! -f /var/lib/grafana/.dashboards-provisioned ]; then
  echo "Provisioning initial dashboards..."
  cp -r /etc/grafana/dashboards/* /var/lib/grafana/dashboards/
  touch /var/lib/grafana/.dashboards-provisioned
fi

# Execute the original Grafana entrypoint
exec /run.sh "$@"