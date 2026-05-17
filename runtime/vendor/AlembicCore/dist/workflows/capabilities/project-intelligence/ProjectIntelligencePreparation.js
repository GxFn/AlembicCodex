import pathGuard from '../../../shared/PathGuard.js';
export async function prepareProjectAnalysisRun({ projectRoot, ctx, options, }) {
    const warnings = [];
    await ensureProjectAnalysisPathGuard(projectRoot);
    if (options.clearOldData) {
        const clearResult = await clearPreviousProjectAnalysisState({ projectRoot, ctx, options });
        warnings.push(...clearResult.warnings);
    }
    return { warnings };
}
async function ensureProjectAnalysisPathGuard(projectRoot) {
    if (pathGuard.configured) {
        return;
    }
    pathGuard.configure({ projectRoot });
}
async function clearPreviousProjectAnalysisState({ projectRoot, ctx, options, }) {
    const warnings = [];
    try {
        const clearRoot = options.dataRoot || projectRoot;
        ctx.logger.info(`[Bootstrap] Core project analysis clearOldData requested for ${clearRoot}; outer workflow checkpoint cleanup remains host-owned`);
    }
    catch (err) {
        warnings.push(`clearOldData failed (non-blocking): ${err instanceof Error ? err.message : String(err)}`);
    }
    return { warnings };
}
