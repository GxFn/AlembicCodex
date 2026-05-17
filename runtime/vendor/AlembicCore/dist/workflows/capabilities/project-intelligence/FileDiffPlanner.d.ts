/**
 * FileDiffPlanner — workflow 文件差异计划器
 *
 * 基于 FileDiffSnapshotStore 存储的文件指纹，检测项目变更范围，
 * 推断受影响维度，并控制内部维度执行链路仅执行受影响维度。
 *
 * 流程:
 *   1. 加载上次成功快照
 *   2. 扫描当前文件 → 计算 diff (added/modified/deleted)
 *   3. 推断受影响维度 → { mode, dimensions, skippedDimensions }
 *   4. 从快照恢复未变更维度的 EpisodicMemory
 *   5. 只对受影响维度执行 dimension fill
 *   6. 完成后保存新快照
 */
import type { BootstrapFile, LoggerLike, RestoredEpisodicMemory, SaveSnapshotParams } from '../../../types/workflows.js';
import { FileDiffSnapshotStore } from './FileDiffSnapshotStore.js';
export declare class FileDiffPlanner {
    #private;
    constructor(db: unknown, projectRoot: string, { logger }?: {
        logger?: LoggerLike | null;
    });
    /**
     * 评估增量可行性 — 在 bootstrap 流程最开始调用
     *
     * @param currentFiles 当前扫描到的文件
     * @param allDimIds 所有可用维度 ID
     */
    evaluate(currentFiles: BootstrapFile[], allDimIds: string[]): {
        canIncremental: boolean;
        mode: string;
        affectedDimensions: string[];
        skippedDimensions: never[];
        previousSnapshot: null;
        diff: null;
        reason: string;
        restoredEpisodic: null;
    } | {
        canIncremental: boolean;
        mode: string;
        affectedDimensions: string[];
        skippedDimensions: string[];
        previousSnapshot: import("./FileDiffSnapshotStore.js").SnapshotData;
        diff: import("./FileDiffSnapshotStore.js").DiffResult;
        reason: string;
        restoredEpisodic: RestoredEpisodicMemory | null;
    };
    /**
     * 保存快照 — 在 bootstrap 完成后调用
     *
     * @param [params.meta] { durationMs, candidateCount, primaryLang }
     * @param [params.plan] evaluate() 返回的计划 (增量时)
     * @returns 快照 ID
     */
    saveSnapshot(params: SaveSnapshotParams): string;
    /** 获取快照管理器 (用于直接查询) */
    getSnapshotManager(): FileDiffSnapshotStore;
}
export default FileDiffPlanner;
