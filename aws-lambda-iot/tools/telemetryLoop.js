'use strict';
import Debug from 'debug';
import { Database } from '../sequelize/sequelize.js';
import { faker } from '@faker-js/faker';

const debug = Debug('iot');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    debug('Creating database tables');
    const db = new Database();
    db.getModels();

    debug('Loading test data');
    const { RaspberryPi, Telemetry } = db.sequelize.models;
    const testDevice = { id: 'testID', name: 'testName' };
    let telemetry = {
        time: null,
        distance: null,
        ping: null,
        raspberryPiId: testDevice.id
    };
    await RaspberryPi.upsert(testDevice);

    const loop = true;
    while (loop) {
        telemetry.time = Date.now();
        telemetry.distance = faker.number.float(10);
        telemetry.ping = faker.number.float(10);
        await Telemetry.upsert(telemetry);
        await sleep(10000);
    }
})();
