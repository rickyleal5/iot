'use strict';
import RaspberryPi from '../models/raspberryPi.js';
import Telemetry from '../models/telemetry.js';

export const getModels = (sequelize, DataTypes) => ({
    RaspberryPi: RaspberryPi(sequelize, DataTypes),
    Telemetry: Telemetry(sequelize, DataTypes)
});

export const transformData = (event) => {
    return {
        raspberryPi: {
            id: event.iotID,
            name: event?.name
        },
        telemetry: {
            time: event.telemetry.time,
            distance: event.telemetry?.distance,
            ping: event.telemetry?.ping,
            raspberryPiId: event.iotID
        }
    };
};

export const grantPrivileges = (sequelize) => {
    return Promise.all([
        sequelize.query(
            `GRANT USAGE ON SCHEMA public TO ${process.env.GRAFANA_USER};`
        ),
        sequelize.query(
            `GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${process.env.GRAFANA_USER};`
        )
    ]);
};

export const createMaterializedViews = async (sequelize) => {
    return Promise.all([
        sequelize.query(
            'CREATE MATERIALIZED VIEW IF NOT EXISTS iot_summary AS \
            SELECT \
                "raspberryPiId", \
                COUNT(*) AS "telemetry_count", \
                AVG(distance) AS "avg_distance", \
                AVG(ping) AS "avg_ping" \
            FROM \
                telemetry \
            GROUP BY \
                "raspberryPiId" \
            ORDER BY \
                "raspberryPiId" \
            WITH NO DATA;'
        )
    ]);
};

export const refreshMaterializedViews = (sequelize) => {
    return Promise.all([
        sequelize.query('REFRESH MATERIALIZED VIEW iot_summary;')
    ]);
};
