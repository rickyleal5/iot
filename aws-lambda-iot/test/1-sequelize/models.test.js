import { describe, it, afterEach, before } from 'mocha';
import { Database } from '../../sequelize/sequelize.js';
import { mocks } from '../mocks/objects/objects.js';
import { expect } from 'chai';

let db;

describe('Database', async function () {
    before(async function () {
        db = new Database();
        db.getModels();
        db.associate();
        await db.sync({ force: true });
        db.createHypertables();
        await db.createMaterializedViews();
    });

    afterEach(async function () {
        const { RaspberryPi, Telemetry } = db.sequelize.models;
        await RaspberryPi.truncate({ cascade: true });
        await Telemetry.truncate({ cascade: true });
    });

    describe('Models', function () {
        describe('RaspberryPi', async function () {
            it('it should create a record in the database', async function () {
                const raspberryPi = mocks.raspberryPi[0];
                const { RaspberryPi } = db.sequelize.models;
                const record = await RaspberryPi.upsert(raspberryPi);
                expect(record[0].dataValues).to.include(raspberryPi);
            });
        });

        describe('Telemetry', async function () {
            it('it should create a record in the database', async function () {
                const telemetry = mocks.telemetry[0];

                const { RaspberryPi, Telemetry } = db.sequelize.models;
                await RaspberryPi.upsert(
                    { id: telemetry.raspberryPiId },
                    { returning: false }
                );
                const record = await Telemetry.upsert(telemetry);

                record[0].dataValues.time = record[0].dataValues.time.getTime();
                expect(record[0].dataValues).to.include(telemetry);
            });
        });
    });
});
