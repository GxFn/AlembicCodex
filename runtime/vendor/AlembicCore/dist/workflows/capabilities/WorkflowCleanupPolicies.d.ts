import type { CleanupResult, RecipeSnapshot } from './RecipeSnapshotTypes.js';
interface CleanupPolicyLogger {
    info(msg: string, meta?: Record<string, unknown>): void;
    warn(msg: string, meta?: Record<string, unknown>): void;
}
export interface CleanupPolicyContext {
    projectRoot: string;
    dataRoot?: string;
    db?: unknown;
    logger?: CleanupPolicyLogger;
    cleanupService?: CleanupPolicyService;
    createCleanupService?: (ctx: CleanupPolicyContext) => CleanupPolicyService;
}
export interface CleanupPolicyService {
    fullReset(): Promise<CleanupResult> | CleanupResult;
    rescanClean(): Promise<CleanupResult> | CleanupResult;
    forceRescanClean(): Promise<CleanupResult> | CleanupResult;
    snapshotRecipes(): Promise<RecipeSnapshot> | RecipeSnapshot;
}
export interface RescanCleanupResult {
    recipeSnapshot: RecipeSnapshot;
    cleanResult: CleanupResult;
}
export declare function createCleanupPolicyService(ctx: CleanupPolicyContext): CleanupPolicyService;
export declare function runFullResetPolicy(ctx: CleanupPolicyContext): Promise<CleanupResult>;
export declare function runRescanCleanPolicy(ctx: CleanupPolicyContext): Promise<RescanCleanupResult>;
/**
 * 强制 Rescan 清理策略。
 *
 * Core 定义策略编排顺序；具体 CleanupService 的文件/DB 写入仍由外层注入。
 */
export declare function runForceRescanCleanPolicy(ctx: CleanupPolicyContext): Promise<RescanCleanupResult>;
export {};
