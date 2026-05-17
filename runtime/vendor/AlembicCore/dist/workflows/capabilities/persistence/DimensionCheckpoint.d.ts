import type { DimensionCheckpointResult } from '../../../types/workflows.js';
export interface DimensionCheckpoint extends DimensionCheckpointResult {
    dimId?: string;
    completedAt?: number;
    candidateCount?: number;
    rejectedCount?: number;
    analysisChars?: number;
    referencedFiles?: number;
    durationMs?: number;
    toolCallCount?: number;
    tokenUsage?: {
        input: number;
        output: number;
    };
    analysisText?: string;
    referencedFilesList?: string[];
    digest?: unknown;
}
/**
 * 保存维度级 checkpoint。
 *
 * Core 只负责 checkpoint 文件本身；internal-agent 的恢复、事件广播、
 * DimensionContext digest 回填留在外层仓库。
 */
export declare function saveDimensionCheckpoint(dataRoot: string, sessionId: string, dimId: string, result: Record<string, unknown>, digest?: unknown): Promise<void>;
export declare function loadDimensionCheckpoints(dataRoot: string, ttlMs?: number): Promise<Map<string, DimensionCheckpoint>>;
export declare function clearDimensionCheckpoints(dataRoot: string): Promise<void>;
export declare const loadCheckpoints: typeof loadDimensionCheckpoints;
export declare const clearCheckpoints: typeof clearDimensionCheckpoints;
