FROM grafana/grafana:latest

COPY ./config.ini /etc/grafana/
COPY ./datasources /etc/grafana/provisioning/datasources/
COPY ./dashboards /etc/grafana/provisioning/dashboards/

COPY ./dashboard-definitions /var/lib/grafana/dashboards/