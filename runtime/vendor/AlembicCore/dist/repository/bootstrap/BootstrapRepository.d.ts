/**
 * BootstrapRepository — Bootstrap 快照的仓储实现
 *
 * 从 BootstrapSnapshot 提取的数据操作，
 * 使用 Drizzle 类型安全 API 操作 bootstrap_snapshots + bootstrap_dim_files 表。
 */
import { bootstrapSnapshots } from '../../infrastructure/database/drizzle/schema.js';
import { RepositoryBase } from '../base/RepositoryBase.js';
export interface BootstrapSnapshotEntity {
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
export interface DimensionStatMeta {
    candidateCount: number;
    analysisChars: number;
    referencedFiles: number;
    durationMs: number;
}
export interface BootstrapSnapshotInsert {
    id: string;
    sessionId?: string | null;
    projectRoot: string;
    createdAt: string;
    durationMs?: number;
    fileCount?: number;
    dimensionCount?: number;
    candidateCount?: number;
    primaryLang?: string | null;
    fileHashes: Record<string, string>;
    dimensionMeta: Record<string, DimensionStatMeta>;
    episodicData?: unknown | null;
    isIncremental?: boolean;
    parentId?: string | null;
    changedFiles?: string[];
    affectedDims?: string[];
    status?: string;
}
export interface DimFileInsert {
    snapshotId: string;
    dimId: string;
    filePath: string;
    role?: string;
}
export interface DimFileEntry {
    dimId: string;
    filePath: string;
}
export declare class BootstrapRepositoryImpl extends RepositoryBase<typeof bootstrapSnapshots, BootstrapSnapshotEntity> {
    #private;
    /** 默认快照保留数量 */
    static readonly MAX_SNAPSHOTS = 5;
    constructor(drizzle: ConstructorParameters<typeof RepositoryBase<typeof bootstrapSnapshots, BootstrapSnapshotEntity>>[0]);
    findById(id: string): Promise<BootstrapSnapshotEntity | null>;
    create(data: BootstrapSnapshotInsert): Promise<BootstrapSnapshotEntity>;
    delete(id: string): Promise<boolean>;
    /** 获取项目最新完成的快照 */
    getLatest(projectRoot: string): Promise<BootstrapSnapshotEntity | null>;
    /** 获取项目的快照列表 (按时间降序) */
    listByProject(projectRoot: string, limit?: number): Promise<BootstrapSnapshotEntity[]>;
    /** 批量插入维度-文件关联 (INSERT OR IGNORE) */
    saveDimFiles(entries: DimFileInsert[]): Promise<number>;
    /** 获取快照的维度-文件关联 */
    getDimFiles(snapshotId: string): Promise<DimFileEntry[]>;
    /** 获取快照中每个维度引用的文件集合 */
    getDimFileMap(snapshotId: string): Promise<Record<string, Set<string>>>;
    /** 保留项目最新 N 个快照，删除旧的 */
    enforceCapacity(projectRoot: string, maxSnapshots?: number): Promise<number>;
    /** 清除项目的所有快照 */
    clearProject(projectRoot: string): Promise<number>;
    /**
     * 事务保存快照 + 维度-文件关联 + 容量控制
     * 替代 BootstrapSnapshot.save() 中的事务逻辑
     */
    saveWithDimFiles(snapshot: BootstrapSnapshotInsert, dimFiles: DimFileInsert[]): Promise<BootstrapSnapshotEntity>;
    /** 获取项目最新的主语言 (Panorama 域用于维度/角色检测) */
    getLatestPrimaryLang(projectRoot: string): Promise<string | null>;
    /** 获取快照总数 */
    getSnapshotCount(projectRoot?: string): Promise<number>;
}
