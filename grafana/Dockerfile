ARG GRAFANA_VERSION="10.2.2"

FROM grafana/grafana:${GRAFANA_VERSION}

ARG CONFIG_FILE=./conf/custom.ini
ARG GF_PATHS_CONFIG=/etc/grafana/custom.ini
ARG GF_PATHS_PROVISIONING=/etc/grafana/provisioning
ARG DATASOURCES_FOLDER=./conf/provisioning/datasources
ARG DASHBOARDS_FOLDER=./conf/provisioning/dashboards
ARG DASHBOARDS_PROVIDER=./conf/provisioning/dashboards/default.yaml

COPY ${CONFIG_FILE} ${GF_PATHS_CONFIG}
COPY ${DASHBOARDS_PROVIDER} ${GF_PATHS_PROVISIONING}/dashboards

ADD ${DATASOURCES_FOLDER} ${GF_PATHS_PROVISIONING}/datasources
ADD ${DASHBOARDS_FOLDER} ${GF_PATHS_PROVISIONING}/dashboards

EXPOSE 3000