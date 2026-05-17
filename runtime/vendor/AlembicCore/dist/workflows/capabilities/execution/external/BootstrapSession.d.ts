/**
 * BootstrapSession — 外部 Agent 驱动的 Bootstrap 会话状态管理
 *
 * 跨多次 MCP 调用保持状态（进程生命周期内有效）。
 * 通过 ServiceContainer 单例注册，每个项目同时只有一个 active session。
 *
 * 职责：
 *   - 维度完成状态跟踪
 *   - Phase 缓存（供 wiki_plan 复用）
 *   - EpisodicMemory 管理
 *   - Cross-dimension hints 收集与分发
 *   - 进度查询
 *   - Session 过期与恢复
 *
 * @module bootstrap/BootstrapSession
 */
import type { DimensionDef } from '../../../../types/project-snapshot.js';
import type { SessionCacheShape } from '../../../../types/snapshot-views.js';
import type { DimensionQualityReport } from './ExternalSubmissionTracker.js';
import { ExternalSubmissionTracker } from './ExternalSubmissionTracker.js';
import { SessionStore } from './MiningSessionStore.js';
/** Bootstrap 会话构造参数 */
interface BootstrapSessionOpts {
    projectRoot: string;
    dimensions: DimensionDef[];
    projectContext?: Record<string, unknown>;
}
/** 维度完成报告 */
interface DimensionReport {
    analysisText?: string;
    findings?: string[];
    keyFindings?: string[];
    referencedFiles?: string[];
    recipeIds?: string[];
    candidateCount?: number;
    [key: string]: unknown;
}
/** 维度完成记录（带时间戳） */
interface DimensionCompletion extends DimensionReport {
    completedAt: number;
}
/** 跨维度 hint 条目 */
interface CrossDimensionHint {
    fromDim: string;
    hint: string;
}
export declare class BootstrapSession {
    expiresAt: number;
    id: string;
    projectRoot: string;
    startedAt: number;
    _activeSession: BootstrapSession | null;
    completedDimensions: Map<string, DimensionCompletion>;
    crossDimensionHints: Record<string, CrossDimensionHint[]>;
    dimensions: DimensionDef[];
    snapshotCache: SessionCacheShape | null;
    sessionStore: SessionStore;
    submissionTracker: ExternalSubmissionTracker;
    /**
     * @param opts.projectRoot 项目根目录
     * @param opts.dimensions 激活的维度定义列表
     * @param [opts.projectContext] 传给 EpisodicMemory 的项目元数据
     */
    constructor({ projectRoot, dimensions, projectContext }: BootstrapSessionOpts);
    get isExpired(): boolean;
    get isComplete(): boolean;
    getProgress(): {
        completed: number;
        total: number;
        completedDimIds: string[];
        remainingDimIds: string[];
    };
    /** 检查某个维度是否已完成 */
    isDimensionComplete(dimId: string): boolean;
    /**
     * 标记维度完成
     * @param report { analysisText, findings, referencedFiles, recipeIds, candidateCount }
     * @returns } - updated=true 表示覆盖了已有记录
     */
    markDimensionComplete(dimId: string, report: DimensionReport): {
        updated: boolean;
        qualityReport: DimensionQualityReport;
    };
    /**
     * 存储跨维度 hints
     * @param fromDimId 来源维度
     * @param hints { targetDimId: hintText }
     */
    storeHints(fromDimId: string, hints: Record<string, string> | Record<string, unknown> | null | undefined): void;
    /**
     * 收集与剩余维度相关的 accumulated hints
     * @returns >>}
     */
    getAccumulatedHints(): Record<string, CrossDimensionHint[]>;
    /**
     * 缓存 Phase 1-4 分析结果（ProjectSnapshot 的 session cache 形式）
     * @param cache toSessionCache(snapshot) 的返回值
     */
    setSnapshotCache(cache: SessionCacheShape | null): void;
    /** 获取 Snapshot 缓存（wiki_plan / dimension-complete 复用） */
    getSnapshotCache(): SessionCacheShape | null;
    toJSON(): {
        id: string;
        projectRoot: string;
        startedAt: number;
        expiresAt: number;
        progress: {
            completed: number;
            total: number;
            completedDimIds: string[];
            remainingDimIds: string[];
        };
        dimensionCount: number;
    };
}
/**
 * BootstrapSessionManager — 管理 active session
 *
 * 设计为进程级单例，通过 ServiceContainer 注册。
 * 同时只有一个 active session（单项目场景）。
 */
export declare class BootstrapSessionManager {
    _activeSession: BootstrapSession | null;
    constructor();
    /**
     * 创建新的 bootstrap session
     * @param opts 传给 BootstrapSession 构造函数的参数
     */
    createSession(opts: BootstrapSessionOpts): BootstrapSession;
    /**
     * 获取 active session
     * @param [sessionId] 可选，用于验证 session ID
     */
    getSession(sessionId?: string): BootstrapSession | null;
    /** 获取 active session，无论是否过期（用于恢复场景） */
    getAnySession(): BootstrapSession | null;
    /** 清除 active session */
    clearSession(): void;
}
export default BootstrapSession;
