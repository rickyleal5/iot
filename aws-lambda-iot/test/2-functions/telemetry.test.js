import { describe, it, before } from 'mocha';
import { Database } from '../../sequelize/sequelize.js';
import { telemetry } from '../mocks/mqtt/telemetry.js';
import { mocks } from '../mocks/objects/objects.js';
import { telemetry as lambda } from '../../functions/handler.js';
import { expect } from 'chai';

let db;

describe('Lambda Functions', async function () {
    before(async function () {
        db = new Database();
        db.getModels();
        db.associate();
        await db.sync({ force: true });
        db.createHypertables();
        await db.createMaterializedViews();
    });

    describe('Telemetry', async function () {
        it('it should store mqtt messages in the database', async function () {
            const mqttEvent = telemetry.data;

            await lambda(mqttEvent);

            const { RaspberryPi, Telemetry } = db.sequelize.models;
            const raspberryPiRecord = await RaspberryPi.findByPk(
                telemetry.data.iotID
            );
            const telemetryRecord = await Telemetry.findAll({
                raw: true,
                where: {
                    raspberryPiId: telemetry.data.iotID
                }
            });

            expect(raspberryPiRecord).to.include(mocks.raspberryPi[0]);
            telemetryRecord[0].time = telemetryRecord[0].time.getTime();
            expect(telemetryRecord[0]).to.include(telemetry.data.telemetry);
        });
    });
});
