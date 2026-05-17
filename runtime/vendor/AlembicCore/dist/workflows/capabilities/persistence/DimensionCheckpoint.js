import fs from 'node:fs/promises';
import path from 'node:path';
import Logger from '../../../infrastructure/logging/Logger.js';
import pathGuard from '../../../shared/PathGuard.js';
const logger = Logger.getInstance();
const CHECKPOINT_TTL_MS = 3600_000;
/**
 * 保存维度级 checkpoint。
 *
 * Core 只负责 checkpoint 文件本身；internal-agent 的恢复、事件广播、
 * DimensionContext digest 回填留在外层仓库。
 */
export async function saveDimensionCheckpoint(dataRoot, sessionId, dimId, result, digest = null) {
    try {
        const checkpointDir = path.join(dataRoot, '.asd', 'bootstrap-checkpoint');
        await fs.mkdir(checkpointDir, { recursive: true });
        await fs.writeFile(path.join(checkpointDir, `${dimId}.json`), JSON.stringify({ dimId, sessionId, ...result, digest, completedAt: Date.now() }), 'utf8');
    }
    catch (err) {
        logger.warn(`[WorkflowCheckpoint] checkpoint save failed for "${dimId}": ${err instanceof Error ? err.message : String(err)}`);
    }
}
export async function loadDimensionCheckpoints(dataRoot, ttlMs = CHECKPOINT_TTL_MS) {
    const checkpoints = new Map();
    const checkpointDir = path.join(dataRoot, '.asd', 'bootstrap-checkpoint');
    const files = await fs.readdir(checkpointDir).catch(() => []);
    const now = Date.now();
    for (const file of files) {
        if (!file.endsWith('.json')) {
            continue;
        }
        try {
            const content = await fs.readFile(path.join(checkpointDir, file), 'utf8');
            const data = JSON.parse(content);
            if (data.dimId && data.completedAt && now - data.completedAt < ttlMs) {
                checkpoints.set(data.dimId, data);
            }
        }
        catch {
            // 跳过损坏 checkpoint，避免单个文件阻断整个恢复流程。
        }
    }
    return checkpoints;
}
export async function clearDimensionCheckpoints(dataRoot) {
    try {
        const checkpointDir = path.join(dataRoot, '.asd', 'bootstrap-checkpoint');
        pathGuard.assertSafe(checkpointDir);
        await fs.rm(checkpointDir, { recursive: true, force: true });
    }
    catch (err) {
        if (err?.name === 'PathGuardError') {
            throw err;
        }
    }
}
export const loadCheckpoints = loadDimensionCheckpoints;
export const clearCheckpoints = clearDimensionCheckpoints;
