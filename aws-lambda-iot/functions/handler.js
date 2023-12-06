'use strict';
import Debug from 'debug';
import { loadDatabase } from '../sequelize/sequelize.js';
import { transformData } from '../sequelize/utils/index.js';

const debug = Debug('iot');

let db = null;

export const telemetry = async (event) => {
    debug('Event: ', JSON.stringify(event));

    if (!db?.sequelize) {
        db = await loadDatabase();
    } else {
        db.sequelize.connectionManager.initPools();

        // eslint-disable-next-line
        if (db.sequelize.connectionManager.hasOwnProperty('getConnection')) {
            delete db.sequelize.connectionManager.getConnection;
        }
    }
    debug('Connected to the database');

    try {
        const { raspberryPi, telemetry } = transformData(event);

        debug('Loading data');
        const { RaspberryPi, Telemetry } = db.sequelize.models;
        await RaspberryPi.upsert(raspberryPi);
        await Telemetry.upsert(telemetry);
    } finally {
        await db.sequelize.connectionManager.close();
    }
    debug('Done!');
};

export default telemetry;
