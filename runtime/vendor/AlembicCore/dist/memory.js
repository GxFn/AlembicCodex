import { drizzle as createBetterSqliteDrizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './infrastructure/database/drizzle/schema.js';
import { MemoryRepositoryImpl, } from './repository/memory/MemoryRepository.js';
export { MemoryRepositoryImpl, };
/**
 * 创建语义记忆仓储。
 *
 * Core 在这里封装 raw SQLite -> Drizzle schema 的装配细节，外层仓库不需要、
 * 也不应该继续 import `infrastructure/database/drizzle/schema`。
 */
export function createSemanticMemoryRepository(source, options = {}) {
    const { drizzle } = resolveSemanticMemoryDatabase(source, options);
    return new MemoryRepositoryImpl(drizzle);
}
export function ensureSemanticMemorySchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS semantic_memories (
      id                TEXT PRIMARY KEY,
      type              TEXT NOT NULL DEFAULT 'fact',
      content           TEXT NOT NULL DEFAULT '',
      source            TEXT NOT NULL DEFAULT 'bootstrap',
      importance        REAL NOT NULL DEFAULT 5.0,
      access_count      INTEGER NOT NULL DEFAULT 0,
      last_accessed_at  TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL,
      expires_at        TEXT,
      related_entities  TEXT DEFAULT '[]',
      related_memories  TEXT DEFAULT '[]',
      source_dimension  TEXT,
      source_evidence   TEXT,
      bootstrap_session TEXT,
      tags              TEXT DEFAULT '[]'
    );

    CREATE INDEX IF NOT EXISTS idx_semantic_memories_type ON semantic_memories(type);
    CREATE INDEX IF NOT EXISTS idx_semantic_memories_source ON semantic_memories(source);
    CREATE INDEX IF NOT EXISTS idx_semantic_memories_importance ON semantic_memories(importance DESC);
    CREATE INDEX IF NOT EXISTS idx_semantic_memories_updated_at ON semantic_memories(updated_at);
    CREATE INDEX IF NOT EXISTS idx_semantic_memories_source_dimension ON semantic_memories(source_dimension);
  `);
}
function resolveSemanticMemoryDatabase(source, options) {
    if (isSemanticMemoryDatabaseHandle(source)) {
        const rawDb = source.getDb?.() ?? null;
        if (rawDb && options.ensureSchema === true) {
            ensureSemanticMemorySchema(rawDb);
        }
        return { drizzle: source.getDrizzle(), rawDb };
    }
    if (isDrizzleDb(source)) {
        return { drizzle: source, rawDb: null };
    }
    if (isRawSqliteDatabase(source)) {
        if (options.ensureSchema !== false) {
            ensureSemanticMemorySchema(source);
        }
        return { drizzle: createBetterSqliteDrizzle(source, { schema }), rawDb: source };
    }
    throw new Error('Semantic memory repository requires a Drizzle DB, SQLite DB, or database handle.');
}
function isSemanticMemoryDatabaseHandle(source) {
    const candidate = source;
    return typeof candidate.getDrizzle === 'function';
}
function isDrizzleDb(source) {
    const candidate = source;
    return (typeof candidate.select === 'function' &&
        typeof candidate.insert === 'function' &&
        typeof candidate.transaction === 'function');
}
function isRawSqliteDatabase(source) {
    const candidate = source;
    return (typeof candidate.prepare === 'function' &&
        typeof candidate.exec === 'function' &&
        typeof candidate.transaction === 'function');
}
