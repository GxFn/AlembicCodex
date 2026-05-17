import Database from 'better-sqlite3';
/** Re-exported type alias so declaration emit can name it */
export type SqliteDatabase = InstanceType<typeof Database>;
import type { WorkspaceResolver } from '../../shared/WorkspaceResolver.js';
import { type DrizzleDB } from './drizzle/index.js';
/**
 * DatabaseConnection - 数据库连接管理器
 *
 * 重要：相对 DB 路径通过 projectRoot 解析，而非 process.cwd()。
 * 这样即使 MCP 服务器的 cwd 不是项目目录，DB 也不会创建到项目外。
 */
export declare class DatabaseConnection {
    #private;
    config: {
        path: string;
        verbose?: boolean;
    };
    db: SqliteDatabase | null;
    drizzle: DrizzleDB | null;
    constructor(config: {
        path: string;
        verbose?: boolean;
    }, workspaceResolver?: WorkspaceResolver | null);
    /** 连接数据库 */
    connect(): Promise<SqliteDatabase>;
    /** 运行所有 migration（支持 .sql、.js、.ts） */
    runMigrations(): Promise<void>;
    /** 关闭数据库连接 */
    close(): void;
    /** 获取数据库实例 */
    getDb(): SqliteDatabase;
    /** 获取 Drizzle ORM 实例 */
    getDrizzle(): DrizzleDB;
}
export default DatabaseConnection;
