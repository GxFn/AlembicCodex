import type BetterSqlite3Database from 'better-sqlite3';
import type { DrizzleDB } from './database.js';
import { MemoryRepositoryImpl, type MemoryStats, type SemanticMemoryEntity, type SemanticMemoryInsert, type SemanticMemorySimilarityResult, type SemanticMemoryUpdate } from './repository/memory/MemoryRepository.js';
export { MemoryRepositoryImpl, type MemoryStats, type SemanticMemoryEntity, type SemanticMemoryInsert, type SemanticMemorySimilarityResult, type SemanticMemoryUpdate, };
export type SemanticMemoryRepository = MemoryRepositoryImpl;
export type SemanticMemorySqliteDatabase = InstanceType<typeof BetterSqlite3Database>;
export interface SemanticMemoryDatabaseHandle {
    getDrizzle(): DrizzleDB;
    getDb?(): SemanticMemorySqliteDatabase;
}
export interface CreateSemanticMemoryRepositoryOptions {
    /**
     * Raw SQLite consumers can ask Core to create the semantic memory table
     * without importing Drizzle schema. Drizzle-only callers should run migrations.
     */
    ensureSchema?: boolean;
}
export type SemanticMemoryRepositorySource = DrizzleDB | SemanticMemorySqliteDatabase | SemanticMemoryDatabaseHandle;
/**
 * 创建语义记忆仓储。
 *
 * Core 在这里封装 raw SQLite -> Drizzle schema 的装配细节，外层仓库不需要、
 * 也不应该继续 import `infrastructure/database/drizzle/schema`。
 */
export declare function createSemanticMemoryRepository(source: SemanticMemoryRepositorySource, options?: CreateSemanticMemoryRepositoryOptions): SemanticMemoryRepository;
export declare function ensureSemanticMemorySchema(db: SemanticMemorySqliteDatabase): void;
