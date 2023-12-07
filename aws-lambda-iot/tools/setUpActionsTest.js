'use strict';
import Debug from 'debug';
import { Database } from '../sequelize/sequelize.js';

const debug = Debug('test');

(async () => {
    debug('Setting up DB');
    const db = new Database();
    await db.sequelize.query('CREATE DATABASE tsdb;');
    await db.sequelize.query(
        // prettier-ignore
        'CREATE ROLE sequelize WITH LOGIN SUPERUSER PASSWORD \'password\';'
    );
    await db.sequelize.query('GRANT USAGE ON SCHEMA public TO sequelize;');
    await db.sequelize.query(
        'GRANT ALL PRIVILEGES ON DATABASE tsdb TO sequelize;'
    );
    await db.sequelize.query(
        // prettier-ignore
        'CREATE ROLE grafana WITH LOGIN PASSWORD \'password\';'
    );
    await db.sync({ force: true });
    debug('Finished setting up DB');
})();
