FROM timescale/timescaledb-ha:pg15.4-ts2.12.2

COPY ./init.sql /docker-entrypoint-initdb.d/

ARG DB_PORT

EXPOSE ${DB_PORT}