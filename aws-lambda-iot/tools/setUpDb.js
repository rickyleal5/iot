'use strict';
import Debug from 'debug';
import { Database } from '../sequelize/sequelize.js';

const debug = Debug('iot');

(async () => {
    debug('Creating database tables');
    const db = new Database();
    db.getModels();
    db.associate();
    await db.sync();
    db.createHypertables();
    await db.createMaterializedViews();
    await db.grantPrivileges();
    await db.sync();
    debug('Done');
})();
