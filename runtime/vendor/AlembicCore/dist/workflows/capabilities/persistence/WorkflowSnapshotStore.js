import Logger from '../../../infrastructure/logging/Logger.js';
import { FileDiffPlanner } from '../project-intelligence/FileDiffPlanner.js';
const logger = Logger.getInstance();
/**
 * 保存 workflow snapshot。
 *
 * 这里仅持有 FileDiffPlanner 写入内核；外层负责决定何时调用、
 * 是否广播事件，以及如何和 internal-agent 恢复流程衔接。
 */
export function saveWorkflowSnapshot({ ctx, projectRoot, sessionId, allFiles, dimensionStats, sessionStore, totalTimeMs, candidateResults, primaryLang, isIncremental, incrementalPlan, createFileDiffPlanner, }) {
    try {
        const db = ctx.container.get('database');
        if (!db) {
            return { status: 'skipped', id: null, reason: 'database unavailable' };
        }
        if (!allFiles) {
            return { status: 'skipped', id: null, reason: 'file list unavailable' };
        }
        const fileDiffPlanner = createFileDiffPlanner(db, projectRoot);
        const snapshotId = fileDiffPlanner.saveSnapshot({
            sessionId,
            allFiles,
            dimensionStats,
            episodicMemory: sessionStore,
            meta: {
                durationMs: totalTimeMs,
                candidateCount: candidateResults.created,
                primaryLang,
            },
            plan: isIncremental ? incrementalPlan || null : null,
        });
        logger.info(`[WorkflowSnapshot] snapshot saved: ${snapshotId}`);
        return {
            status: 'saved',
            id: snapshotId,
            fileCount: allFiles.length,
            dimensionCount: Object.keys(dimensionStats).length,
        };
    }
    catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        logger.warn(`[WorkflowSnapshot] snapshot save failed: ${reason}`);
        return { status: 'failed', id: null, reason };
    }
}
export function createDefaultFileDiffPlanner(db, projectRoot) {
    return new FileDiffPlanner(db, projectRoot, { logger });
}
