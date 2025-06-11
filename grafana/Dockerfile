FROM grafana/grafana:latest

# Copy configuration file
COPY ./config.ini /etc/grafana/grafana.ini

# Copy provisioning configs
COPY ./provisioning/dashboards/ /etc/grafana/provisioning/dashboards/
COPY ./provisioning/datasources/ /etc/grafana/provisioning/datasources/

# Copy dashboard definitions to where Grafana expects them
COPY ./dashboards/ /var/lib/grafana/dashboards/