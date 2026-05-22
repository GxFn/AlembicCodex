import { existsSync } from 'node:fs';
import Database from 'better-sqlite3';
export function resolveSqliteDb(db) {
    if (!db) {
        return null;
    }
    const wrapper = db;
    if (typeof wrapper.getDb === 'function') {
        return wrapper.getDb();
    }
    return db;
}
export function getLatestSchemaMigrationVersion(db) {
    try {
        const rawDb = resolveSqliteDb(db);
        const row = rawDb
            ?.prepare('SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1')
            .get();
        return row?.version || null;
    }
    catch {
        return null;
    }
}
export function readCodexSourceRefState(databasePath) {
    if (!existsSync(databasePath)) {
        return {
            activeCount: 0,
            databasePath,
            reason: 'database does not exist',
            renamedCount: 0,
            staleCount: 0,
            staleRecipeCount: 0,
            status: 'missing',
            tableExists: false,
            totalCount: 0,
        };
    }
    return withReadonlyDatabase(databasePath, (db) => {
        if (!sqliteTableExists(db, 'recipe_source_refs')) {
            return {
                activeCount: 0,
                databasePath,
                reason: 'recipe_source_refs table does not exist',
                renamedCount: 0,
                staleCount: 0,
                staleRecipeCount: 0,
                status: 'missing',
                tableExists: false,
                totalCount: 0,
            };
        }
        const row = db
            .prepare(`SELECT
          count(*) AS totalCount,
          sum(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCount,
          sum(CASE WHEN status = 'stale' THEN 1 ELSE 0 END) AS staleCount,
          sum(CASE WHEN status = 'renamed' THEN 1 ELSE 0 END) AS renamedCount,
          count(DISTINCT CASE WHEN status = 'stale' THEN recipe_id ELSE NULL END) AS staleRecipeCount
        FROM recipe_source_refs`)
            .get();
        const staleCount = numeric(row.staleCount);
        return {
            activeCount: numeric(row.activeCount),
            databasePath,
            reason: staleCount > 0 ? 'recipe source references contain stale files' : null,
            renamedCount: numeric(row.renamedCount),
            staleCount,
            staleRecipeCount: numeric(row.staleRecipeCount),
            status: staleCount > 0 ? 'stale' : 'ready',
            tableExists: true,
            totalCount: numeric(row.totalCount),
        };
    });
}
export function readCodexSnapshotState(databasePath, projectRoot) {
    if (!existsSync(databasePath)) {
        return {
            databasePath,
            latest: null,
            reason: 'database does not exist',
            status: 'missing',
            tableExists: false,
            totalCount: 0,
        };
    }
    return withReadonlyDatabase(databasePath, (db) => {
        if (!sqliteTableExists(db, 'bootstrap_snapshots')) {
            return {
                databasePath,
                latest: null,
                reason: 'bootstrap_snapshots table does not exist',
                status: 'missing',
                tableExists: false,
                totalCount: 0,
            };
        }
        const total = db
            .prepare('SELECT count(*) AS totalCount FROM bootstrap_snapshots WHERE project_root = ?')
            .get(projectRoot);
        const latest = db
            .prepare(`SELECT id, session_id, created_at, file_count, dimension_count, candidate_count,
          primary_lang, is_incremental, changed_files, affected_dims
         FROM bootstrap_snapshots
         WHERE project_root = ? AND status = 'complete'
         ORDER BY created_at DESC
         LIMIT 1`)
            .get(projectRoot);
        return {
            databasePath,
            latest: latest
                ? {
                    affectedDimsCount: jsonArrayLength(latest.affected_dims),
                    candidateCount: numeric(latest.candidate_count),
                    changedFilesCount: jsonArrayLength(latest.changed_files),
                    createdAt: String(latest.created_at || ''),
                    dimensionCount: numeric(latest.dimension_count),
                    fileCount: numeric(latest.file_count),
                    id: String(latest.id || ''),
                    isIncremental: numeric(latest.is_incremental) === 1,
                    primaryLang: typeof latest.primary_lang === 'string' ? latest.primary_lang : null,
                    sessionId: typeof latest.session_id === 'string' ? latest.session_id : null,
                }
                : null,
            reason: latest ? null : 'no complete bootstrap snapshot exists',
            status: latest ? 'ready' : 'missing',
            tableExists: true,
            totalCount: numeric(total.totalCount),
        };
    });
}
export function listTableColumnNames(db, tableName) {
    const table = assertSqlIdentifier(tableName);
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    return columns.map((column) => column.name).filter((name) => Boolean(name));
}
export function queryRecipeSnapshotRows(db, input) {
    return db
        .prepare(`SELECT id, title, trigger, ${input.hasDimensionId ? 'dimensionId' : "'' AS dimensionId"},
              category, knowledgeType, doClause,
              sourceFile, lifecycle, content, json_extract(reasoning, '$.sources') AS sourceRefsJson
       FROM knowledge_entries
       WHERE ${input.lifecycleFilterSql}`)
        .all(...input.lifecycleParams);
}
export function exportTablesAsJsonLines(db, tablesToExport) {
    let totalRows = 0;
    const lines = [];
    for (const tableName of tablesToExport) {
        try {
            const table = assertSqlIdentifier(tableName);
            const rows = db.prepare(`SELECT * FROM ${table}`).all();
            for (const row of rows) {
                lines.push(JSON.stringify({ _table: tableName, ...row }));
                totalRows++;
            }
        }
        catch {
            // 表可能不存在，跳过；调用方负责记录汇总结果。
        }
    }
    return { lines, totalRows };
}
export function clearTables(db, tables) {
    const clearedTables = [];
    const errors = [];
    for (const tableName of tables) {
        try {
            const table = assertSqlIdentifier(tableName);
            db.exec(`DELETE FROM ${table}`);
            clearedTables.push(tableName);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!msg.includes('no such table')) {
                errors.push(`Failed to clear ${tableName}: ${msg}`);
            }
        }
    }
    return { clearedTables, errors };
}
export function deleteKnowledgeEntriesByLifecycle(db, lifecycles) {
    try {
        const placeholders = lifecycles.map(() => '?').join(', ');
        db.prepare(`DELETE FROM knowledge_entries WHERE lifecycle IN (${placeholders})`).run(...lifecycles);
        return { cleared: true, error: null };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { cleared: false, error: `Failed to clean old entries: ${msg}` };
    }
}
export function flushHitRecorderStats(db, entries, updatedAt) {
    const stmt = db.prepare(`UPDATE knowledge_entries
     SET stats = json_set(
           COALESCE(stats, '{}'),
           '$.' || ?,
           COALESCE(json_extract(stats, '$.' || ?), 0) + ?
         ),
         updatedAt = ?
     WHERE id = ?`);
    let flushed = 0;
    for (const entry of entries) {
        try {
            stmt.run(entry.statsField, entry.statsField, entry.count, updatedAt, entry.recipeId);
            flushed += entry.count;
        }
        catch {
            // Recipe 可能已被删除，保持原有静默忽略行为。
        }
    }
    return flushed;
}
function withReadonlyDatabase(databasePath, reader) {
    const db = openReadonlyDatabase(databasePath);
    if (!db) {
        return unavailable(databasePath);
    }
    try {
        return reader(db);
    }
    catch {
        return unavailable(databasePath, true);
    }
    finally {
        db.close?.();
    }
}
function openReadonlyDatabase(databasePath) {
    try {
        return new Database(databasePath, { fileMustExist: true, readonly: true });
    }
    catch {
        return null;
    }
}
function sqliteTableExists(db, tableName) {
    const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
        .get(tableName);
    return row?.name === tableName;
}
function unavailable(databasePath, queried = false) {
    return {
        activeCount: 0,
        databasePath,
        latest: null,
        reason: queried
            ? 'database table could not be queried'
            : 'database could not be opened read-only',
        renamedCount: 0,
        staleCount: 0,
        staleRecipeCount: 0,
        status: 'unavailable',
        tableExists: queried,
        totalCount: 0,
    };
}
function assertSqlIdentifier(identifier) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
        throw new Error(`Unsafe SQLite identifier: ${identifier}`);
    }
    return identifier;
}
function numeric(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : Number(value || 0) || 0;
}
function jsonArrayLength(value) {
    if (typeof value !== 'string') {
        return 0;
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.length : 0;
    }
    catch {
        return 0;
    }
}
