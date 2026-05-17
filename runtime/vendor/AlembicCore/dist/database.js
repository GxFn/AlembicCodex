import { DatabaseConnection, } from './infrastructure/database/DatabaseConnection.js';
export { DatabaseConnection };
export function createDatabaseConnection(config, workspaceResolver) {
    return new DatabaseConnection(config, workspaceResolver);
}
export async function openAlembicDatabase(config, options = {}) {
    const connection = createDatabaseConnection(config, options.workspaceResolver ?? null);
    const sqlite = await connection.connect();
    let migrated = false;
    if (options.runMigrations !== false) {
        await connection.runMigrations();
        migrated = true;
    }
    return {
        connection,
        sqlite,
        drizzle: connection.getDrizzle(),
        migrated,
        close: () => connection.close(),
    };
}
export function assertAlembicDatabaseHandle(database) {
    if (!database || typeof database !== 'object') {
        throw new Error('Alembic database handle is required.');
    }
    const candidate = database;
    if (typeof candidate.getDb !== 'function' || typeof candidate.getDrizzle !== 'function') {
        throw new Error('Alembic database handle must expose getDb() and getDrizzle().');
    }
}
