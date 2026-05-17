export function createCleanupPolicyService(ctx) {
    const service = ctx.cleanupService ?? ctx.createCleanupService?.(ctx);
    if (!service) {
        throw new Error('[WorkflowCleanupPolicies] cleanupService or createCleanupService is required in Core');
    }
    return service;
}
export async function runFullResetPolicy(ctx) {
    return createCleanupPolicyService(ctx).fullReset();
}
export async function runRescanCleanPolicy(ctx) {
    const cleanupService = createCleanupPolicyService(ctx);
    const recipeSnapshot = await cleanupService.snapshotRecipes();
    const cleanResult = await cleanupService.rescanClean();
    return { recipeSnapshot, cleanResult };
}
/**
 * 强制 Rescan 清理策略。
 *
 * Core 定义策略编排顺序；具体 CleanupService 的文件/DB 写入仍由外层注入。
 */
export async function runForceRescanCleanPolicy(ctx) {
    const cleanupService = createCleanupPolicyService(ctx);
    const recipeSnapshot = await cleanupService.snapshotRecipes();
    const cleanResult = await cleanupService.forceRescanClean();
    return { recipeSnapshot, cleanResult };
}
