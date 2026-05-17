import type { DimensionDef } from '../../../../types/project-snapshot.js';
import { saveDimensionCheckpoint } from '../../persistence/DimensionCheckpoint.js';
export interface ExternalDimensionCompleteArgs {
    sessionId?: unknown;
    dimensionId?: unknown;
    submittedRecipeIds?: unknown;
    analysisText?: unknown;
    referencedFiles?: unknown;
    keyFindings?: unknown;
    candidateCount?: unknown;
    crossDimensionHints?: unknown;
    [key: string]: unknown;
}
interface ExternalCompletionLogger {
    info(msg: string, meta?: Record<string, unknown>): void;
    warn(msg: string, meta?: Record<string, unknown>): void;
    debug?(msg: string, meta?: Record<string, unknown>): void;
}
export interface ExternalSessionContainer {
    get(name: string): unknown;
    services?: Record<string, unknown>;
    singletons?: Record<string, unknown>;
}
interface ExternalCompletionContainer extends ExternalSessionContainer {
    get(name: string): unknown;
}
export interface ExternalDimensionCompletionContext {
    container: ExternalCompletionContainer;
    logger?: ExternalCompletionLogger;
    dataRoot?: string;
    [key: string]: unknown;
}
export interface ExternalDimensionCompletionResponse<T = unknown> {
    success: boolean;
    data?: T | null;
    message?: string;
    meta?: Record<string, unknown>;
    errorCode?: string | null;
}
export interface ExternalDimensionCompletionDependencies {
    getActiveSession?: (container: ExternalSessionContainer, sessionId?: string) => Promise<ExternalWorkflowSession | null> | ExternalWorkflowSession | null;
    saveCheckpoint?: typeof saveDimensionCheckpoint;
    now?: () => number;
    onDimensionComplete?: (event: ExternalDimensionCompletedEvent) => void | Promise<void>;
}
export interface ExternalDimensionCompletedEvent {
    sessionId: string;
    dimensionId: string;
    candidateCount: number;
    recipesBound: number;
    progress: ReturnType<ExternalWorkflowSession['getProgress']>;
    isComplete: boolean;
    updated: boolean;
}
export interface ExternalWorkflowSession {
    id: string;
    projectRoot: string;
    expiresAt?: number;
    dimensions: DimensionDef[];
    submissionTracker: {
        getSubmissions(dimId: string): Array<{
            recipeId?: string;
            sources: string[];
        }>;
        getAccumulatedEvidence(dimId: string): unknown;
    };
    sessionStore: {
        getDimensionReport(dimId: string): unknown;
    };
    getSnapshotCache?(): {
        localPackageModules?: readonly {
            packageName: string;
            name: string;
        }[];
    } | null;
    getProgress(): {
        completed: number;
        total: number;
        completedDimIds: string[];
        remainingDimIds: string[];
    };
    readonly isComplete: boolean;
    markDimensionComplete(dimensionId: string, report: {
        analysisText: string;
        keyFindings: string[];
        referencedFiles: string[];
        recipeIds: string[];
        candidateCount: number;
    }): {
        updated: boolean;
        qualityReport?: {
            totalScore: number;
            pass: boolean;
            scores: Record<string, number>;
            suggestions: string[];
        };
    };
    storeHints(dimId: string, hints: Record<string, unknown>): void;
    getAccumulatedHints(): Record<string, unknown>;
}
/**
 * 外部宿主 agent 的维度完成闭环。
 *
 * Core 负责校验、从提交追踪器恢复 evidence、绑定 Recipe、保存 checkpoint、
 * 写入关键发现和返回质量反馈；Skill 生成、事件广播、交付 finalizer、
 * 具体 MCP tool meta/nextActions 均由外层仓库处理。
 */
export declare function runExternalDimensionCompletionWorkflow(ctx: ExternalDimensionCompletionContext, args: ExternalDimensionCompleteArgs, dependencies?: ExternalDimensionCompletionDependencies): Promise<ExternalDimensionCompletionResponse>;
export {};
