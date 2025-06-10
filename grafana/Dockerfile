FROM grafana/grafana:latest

COPY ./provisioning /etc/grafana/provisioning
COPY ./config.ini /etc/grafana/config.ini

COPY ./dashboards /etc/grafana/dashboards

# Add an entrypoint script to handle initialization
COPY ./init.sh /
RUN chmod +x /init.sh

# Make sure Grafana's entrypoint is properly called
ENTRYPOINT ["/init.sh"]