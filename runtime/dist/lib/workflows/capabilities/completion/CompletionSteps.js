/**
 * CompletionSteps — Workflow 完成阶段的各步骤实现
 *
 * 包含 Panorama 刷新和语义记忆固化，
 * 由 WorkflowCompletionFinalizer 按顺序调用。
 */
// ── PanoramaCompletionStep ──
export async function refreshPanorama({ getServiceContainer, log, }) {
    try {
        const container = await getServiceContainer();
        const panoramaService = container.services?.panoramaService
            ? container.get?.('panoramaService')
            : undefined;
        if (!panoramaService || typeof panoramaService.rescan !== 'function') {
            return;
        }
        await panoramaService.rescan();
        const overview = await panoramaService.getOverview();
        log.info(`[DimensionComplete] Panorama refreshed — ${overview.moduleCount} modules, ${overview.gapCount} gaps`);
    }
    catch (err) {
        log.warn(`[DimensionComplete] Panorama refresh failed (non-blocking): ${err instanceof Error ? err.message : String(err)}`);
    }
}
export async function consolidateSemanticMemory({ ctx, session, dataRoot, log, dependencies = {}, }) {
    if (!dependencies.createPersistentMemory || !dependencies.createConsolidator) {
        log.info(`[DimensionComplete] Semantic Memory consolidation skipped for ${session.id}: local agent memory has been removed from AlembicPlugin.`);
        return null;
    }
    const db = ctx.container.get?.('database') ?? ctx.container.get?.('db');
    if (!db || !session.sessionStore) {
        return null;
    }
    try {
        const semanticMemory = await dependencies.createPersistentMemory(db, dataRoot, log);
        const consolidator = await dependencies.createConsolidator(semanticMemory, log);
        const result = await consolidator.consolidate(session.sessionStore, {
            bootstrapSession: session.id,
            clearPrevious: true,
        });
        return result && typeof result === 'object'
            ? result
            : null;
    }
    catch (err) {
        log.warn(`[DimensionComplete] Semantic Memory consolidation failed (non-blocking): ${err instanceof Error ? err.message : String(err)}`);
        return null;
    }
}
