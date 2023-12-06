import { describe, it } from 'mocha';
import { Database } from '../../sequelize/sequelize.js';
import { expect } from 'chai';
import { mocks } from '../mocks/objects/objects.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('Database', async function () {
    describe('Sequelize', function () {
        it('should get all models', async function () {
            const database = new Database();
            await database.sync({ force: true });
            expect(Object.keys(database.sequelize.models).length).to.equal(0);

            database.getModels();
            await database.sync();
            expect(Object.keys(database.sequelize.models).length).to.equal(2);
        });

        it('should grant privileges', async function () {
            const database = new Database();
            database.getModels();
            await database.sync();
            await database.grantPrivileges();

            const result = await database.sequelize.query(
                `SELECT   pg_catalog.has_schema_privilege('${process.env.GRAFANA_USER}', 'public', 'USAGE');`,
                { plain: true }
            );

            expect(result.has_schema_privilege).to.be.true;
        });

        it('should create and refresh materialized views', async function () {
            const materializedView = 'iot_summary';
            const database = new Database();
            database.getModels();
            await database.sync({ force: true });
            await database.createMaterializedViews();
            await database.sync();

            let result = await database.sequelize.query(
                'SELECT   matviewname, definition from pg_matviews;',
                { plain: true }
            );

            expect(result.matviewname).to.equal(materializedView);

            const telemetry = mocks.telemetry[0];

            const { RaspberryPi, Telemetry } = database.sequelize.models;
            await RaspberryPi.upsert(
                { id: telemetry.raspberryPiId },
                { returning: false }
            );
            await Telemetry.upsert(telemetry, { returning: false });
            await Telemetry.create({ ...telemetry, time: 2, distance: 10.0 });

            await database.refreshMaterializedViews();
            await database.sync();
            await sleep(1000);

            result = await database.sequelize.query(
                `SELECT   * from ${materializedView};`,
                { plain: true }
            );

            expect(result.raspberryPiId).to.equal(telemetry.raspberryPiId);
            expect(result.avg_distance).to.equal(7.5);
            expect(result.avg_ping).to.equal(5.0);
            expect(parseInt(result.telemetry_count)).to.equal(2);
        });
    });
});
