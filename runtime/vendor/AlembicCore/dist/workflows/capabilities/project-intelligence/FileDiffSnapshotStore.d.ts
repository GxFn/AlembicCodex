/**
 * FileDiffSnapshotStore — workflow 文件快照管理
 *
 * 负责:
 * 1. 保存每次 workflow 完成后的文件指纹 (path → hash)
 * 2. 记录每个维度引用了哪些文件
 * 3. 持久化 EpisodicMemory 摘要
 * 4. 提供增量 diff 计算
 *
 * 存储: SQLite bootstrap_snapshots + bootstrap_dim_files 表（runtime schema 兼容名）
 * 所有操作使用 Drizzle 类型安全 API。
 */
import type { LoggerLike } from '../../../types/workflows.js';
/** 快照反序列化结果 */
export interface SnapshotData {
    id: string;
    sessionId: string | null;
    projectRoot: string;
    createdAt: string;
    durationMs: number;
    fileCount: number;
    dimensionCount: number;
    candidateCount: number;
    primaryLang: string | null;
    fileHashes: Record<string, string>;
    dimensionMeta: Record<string, DimensionStatMeta>;
    episodicData: Record<string, unknown> | null;
    isIncremental: boolean;
    parentId: string | null;
    changedFiles: string[];
    affectedDims: string[];
    status: string;
}
/** 文件条目 */
interface SnapshotFile {
    path: string;
    relativePath?: string;
    content?: string;
    targetName?: string;
}
/** save() 参数 */
interface SaveParams {
    sessionId?: string;
    projectRoot: string;
    allFiles: SnapshotFile[];
    dimensionStats?: Record<string, DimensionStatInput>;
    episodicData?: unknown;
    meta?: {
        durationMs?: number;
        candidateCount?: number;
        primaryLang?: string;
        [key: string]: unknown;
    };
    isIncremental?: boolean;
    parentId?: unknown;
    changedFiles?: string[];
    affectedDims?: string[];
}
/** 维度统计输入 */
interface DimensionStatInput {
    candidateCount?: number;
    analysisChars?: number;
    referencedFiles?: number;
    durationMs?: number;
    referencedFilesList?: string[];
    [key: string]: unknown;
}
/** 维度元数据（序列化后） */
interface DimensionStatMeta {
    candidateCount: number;
    analysisChars: number;
    referencedFiles: number;
    durationMs: number;
}
/** Diff 结果 */
export interface DiffResult {
    added: string[];
    modified: string[];
    deleted: string[];
    unchanged: string[];
    changeRatio: number;
}
/** 受影响维度推断结果 */
interface AffectedDimensionResult {
    mode: 'incremental' | 'full';
    dimensions: string[];
    skippedDimensions: string[];
    reason: string;
}
export declare function normalizeSnapshotPath(file: {
    path?: string;
    relativePath?: string;
}, projectRoot: string): string;
export interface ReconciledSnapshotHashes {
    hashes: Record<string, string>;
    remapped: Record<string, string>;
    ambiguous: string[];
}
export declare function reconcileSnapshotHashes(snapshotHashes: Record<string, string>, currentPaths: Iterable<string>): ReconciledSnapshotHashes;
export declare class FileDiffSnapshotStore {
    #private;
    /** @param db DatabaseConnection 或 better-sqlite3 实例 */
    constructor(db: unknown, { logger }?: {
        logger?: LoggerLike | null;
    });
    /**
     * 保存一次 workflow 完成后的快照
     *
     * @param params.sessionId Workflow 会话 ID
     * @param params.projectRoot 项目根目录
     * @param params.allFiles 扫描到的文件列表
     * @param params.dimensionStats { dimId: { referencedFiles: string[] } }
     * @param [params.episodicData] EpisodicMemory.toJSON()
     * @param [params.meta] { durationMs, candidateCount, primaryLang }
     * @param [params.isIncremental] 是否 file-diff incremental
     * @param [params.parentId] 增量时的父快照 ID
     * @param [params.changedFiles] 增量时的变更文件
     * @param [params.affectedDims] 增量时受影响的维度
     * @returns 快照 ID
     */
    save(params: SaveParams): string;
    /** 清除项目的所有快照 — 用于手动重新冷启动时强制全量 */
    clearProject(projectRoot: string): void;
    /**
     * 加载最新的快照
     *
     * @returns 快照数据
     */
    getLatest(projectRoot: string): SnapshotData | null;
    /** 根据 ID 加载快照 */
    getById(id: string): SnapshotData | null;
    /** 获取项目的所有快照 (按时间降序) */
    list(projectRoot: string, limit?: number): SnapshotData[];
    /**
     * 计算当前文件与快照的 diff
     *
     * @param snapshot getLatest() 返回的快照
     * @param currentFiles 当前文件列表
     * @returns }
     */
    computeDiff(snapshot: SnapshotData, currentFiles: SnapshotFile[], projectRoot: string): DiffResult;
    /**
     * 根据文件变更推断受影响的维度
     *
     * 策略:
     * 1. 查找变更文件被哪些维度引用 → 直接受影响
     * 2. 新增文件按文件类型推断可能相关的维度
     * 3. 如果变更比例超过阈值 → 建议全量
     *
     * @param snapshot 上次快照
     * @param diff
     * @param allDimIds 所有可用维度 ID
     * @returns }
     */
    inferAffectedDimensions(snapshot: SnapshotData, diff: DiffResult, allDimIds: string[]): AffectedDimensionResult;
}
export default FileDiffSnapshotStore;
