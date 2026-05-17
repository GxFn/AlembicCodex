import { DatabaseConnection, type SqliteDatabase } from './infrastructure/database/DatabaseConnection.js';
import type { DrizzleDB } from './infrastructure/database/drizzle/index.js';
import type { WorkspaceResolver } from './shared/WorkspaceResolver.js';
export { DatabaseConnection };
export type { DrizzleDB, SqliteDatabase };
export interface AlembicDatabaseConfig {
    path: string;
    verbose?: boolean;
}
export interface AlembicDatabaseHandle {
    getDb(): SqliteDatabase;
    getDrizzle(): DrizzleDB;
    runMigrations?(): Promise<void> | void;
    close?(): void;
}
export interface OpenAlembicDatabaseOptions {
    workspaceResolver?: WorkspaceResolver | null;
    runMigrations?: boolean;
}
export interface AlembicDatabaseRuntime {
    connection: DatabaseConnection;
    sqlite: SqliteDatabase;
    drizzle: DrizzleDB;
    migrated: boolean;
    close(): void;
}
export declare function createDatabaseConnection(config: AlembicDatabaseConfig, workspaceResolver?: WorkspaceResolver | null): DatabaseConnection;
export declare function openAlembicDatabase(config: AlembicDatabaseConfig, options?: OpenAlembicDatabaseOptions): Promise<AlembicDatabaseRuntime>;
export declare function assertAlembicDatabaseHandle(database: unknown): asserts database is AlembicDatabaseHandle;
