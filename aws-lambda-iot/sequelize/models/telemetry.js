'use strict';
import { Model } from 'sequelize';
import Debug from 'debug';
const debug = Debug('database');

export const model = (sequelize, DataTypes) => {
    const modelName = 'Telemetry';
    const tableName = 'telemetry';
    class Telemetry extends Model {
        static associate() {
            const { RaspberryPi } = sequelize.models;
            this.belongsTo(RaspberryPi, {
                foreignKey: 'raspberryPiId',
                as: 'raspberry_pi',
                allowNull: false
            });
        }

        static async createHypertable() {
            debug(`${modelName}: createHypertable`);
            return sequelize.query(
                `SELECT create_hypertable('${tableName}', 'time');`
            );
        }
    }
    Telemetry.init(
        {
            time: {
                type: DataTypes.DATE,
                primaryKey: true
            },
            distance: DataTypes.FLOAT,
            ping: DataTypes.FLOAT,
            raspberryPiId: DataTypes.STRING
        },
        {
            sequelize,
            modelName,
            tableName
        }
    );

    // eslint-disable-next-line
    Telemetry.afterUpsert(async (telemetry, options) => {
        await sequelize.query('REFRESH MATERIALIZED VIEW iot_summary;', {
            transaction: options.transaction
        });
    });

    return Telemetry;
};

export default model;
