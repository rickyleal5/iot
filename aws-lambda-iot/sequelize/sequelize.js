'use strict';
import {
    Sequelize,
    DataTypes,
    ConnectionTimedOutError,
    TimeoutError
} from 'sequelize';
import Debug from 'debug';
import {
    getModels,
    grantPrivileges,
    createMaterializedViews,
    refreshMaterializedViews
} from './utils/index.js';

const debugSequelize = Debug('sequelize');
const debug = Debug('database');

const config = {
    database: process.env.DATABASE,
    username: process.env.SEQUELIZE_USER,
    password: process.env.POSTGRES_PASSWORD,
    dialect: process.env.DIALECT,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    logging: debugSequelize,
    retry: {
        max: 3,
        match: [/Deadlock/i, ConnectionTimedOutError, TimeoutError]
    },
    pool: {
        max: 2,
        min: 0,
        idle: 0,
        acquire: 3000,
        evict: 15000
    },
    dialectOptions: {
        supportBigNumbers: true,
        bigNumberStrings: true
    }
};

export class Database {
    constructor() {
        this.sequelize = new Sequelize(config);
        this.sequelize.sync();
    }

    getModels() {
        debug('Getting models');
        this.sequelize.models = getModels(this.sequelize, DataTypes);
        debug(`Got models: ${Object.keys(this.sequelize.models)}`);
    }

    associate() {
        debug('Creating associations');
        const { models } = this.sequelize;

        Object.values(models).map((model) => {
            if (model.associate) model.associate();
            return null;
        });
    }

    sync(options = {}) {
        debug('Syncing DB');
        return this.sequelize.sync(options);
    }

    grantPrivileges() {
        debug('Grant privileges on new tables to Grafana');
        return grantPrivileges(this.sequelize);
    }

    createHypertables() {
        debug('Create hypertables');
        const { models } = this.sequelize;

        Object.values(models).map(async (model) => {
            if (model.createHypertable) model.createHypertable();
            return null;
        });
    }

    createMaterializedViews() {
        debug('Creating materialized views');
        return createMaterializedViews(this.sequelize);
    }

    refreshMaterializedViews() {
        debug('Refreshing materialized views');
        return refreshMaterializedViews(this.sequelize);
    }
}

export const loadDatabase = async () => {
    const db = new Database();
    db.getModels();
    await db.sync();
    return db;
};

export default Database;
