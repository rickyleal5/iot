'use strict';
import { Database } from '../sequelize/sequelize.js';

(async () => {
    const db = new Database();
    await db.grantPrivileges();
    await db.sync();
})();
