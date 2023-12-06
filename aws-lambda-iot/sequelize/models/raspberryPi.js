'use strict';
import { Model } from 'sequelize';

export const model = (sequelize, DataTypes) => {
    const modelName = 'RaspberryPi';
    const tableName = 'raspberry_pi';
    class RaspberryPi extends Model {
        static associate() {
            const { Telemetry } = sequelize.models;
            this.hasMany(Telemetry, {
                foreignKey: 'raspberryPiId',
                as: 'telemetry',
                allowNull: false
            });
        }
    }
    RaspberryPi.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false
            },
            name: DataTypes.STRING
        },
        {
            sequelize,
            modelName,
            tableName
        }
    );

    return RaspberryPi;
};

export default model;
