import Logger from '@alembic/core/logging';
const logger = Logger.getInstance();
export const DASHBOARD_OPERATION_IDS = {
    updateModuleMap: 'dashboard.update_module_map',
    rebuildSemanticIndex: 'dashboard.rebuild_semantic_index',
    scanProject: 'dashboard.scan_project',
    bootstrapProject: 'dashboard.bootstrap_project',
    cancelBootstrap: 'dashboard.cancel_bootstrap',
    rescanProject: 'dashboard.rescan_project',
};
export const DASHBOARD_OPERATION_MANIFESTS = [
    manifest({
        id: DASHBOARD_OPERATION_IDS.updateModuleMap,
        title: 'Update Module Map',
        description: 'Refresh the project module map from Dashboard.',
        policyProfile: 'write',
    }),
    manifest({
        id: DASHBOARD_OPERATION_IDS.rebuildSemanticIndex,
        title: 'Rebuild Semantic Index',
        description: 'Rebuild the semantic vector index from Dashboard.',
        policyProfile: 'system',
        timeoutMs: 300_000,
    }),
    manifest({
        id: DASHBOARD_OPERATION_IDS.scanProject,
        title: 'Scan Project',
        description: 'Run a full project scan from Dashboard.',
        policyProfile: 'analysis',
        timeoutMs: 300_000,
    }),
    manifest({
        id: DASHBOARD_OPERATION_IDS.bootstrapProject,
        title: 'Bootstrap Project Knowledge',
        description: 'Start host-driven project bootstrap from Dashboard.',
        policyProfile: 'write',
        timeoutMs: 300_000,
    }),
    manifest({
        id: DASHBOARD_OPERATION_IDS.cancelBootstrap,
        title: 'Cancel Bootstrap Session',
        description: 'Cancel the active bootstrap or rescan background session from Dashboard.',
        policyProfile: 'write',
    }),
    manifest({
        id: DASHBOARD_OPERATION_IDS.rescanProject,
        title: 'Rescan Project Knowledge',
        description: 'Run host-driven project rescan from Dashboard.',
        policyProfile: 'write',
        timeoutMs: 300_000,
    }),
];
export const DASHBOARD_OPERATION_HANDLERS = {
    [DASHBOARD_OPERATION_IDS.updateModuleMap]: updateModuleMap,
    [DASHBOARD_OPERATION_IDS.rebuildSemanticIndex]: rebuildSemanticIndex,
    [DASHBOARD_OPERATION_IDS.scanProject]: scanProject,
    [DASHBOARD_OPERATION_IDS.bootstrapProject]: bootstrapProject,
    [DASHBOARD_OPERATION_IDS.cancelBootstrap]: cancelBootstrap,
    [DASHBOARD_OPERATION_IDS.rescanProject]: rescanProject,
};
function manifest(input) {
    return {
        id: input.id,
        title: input.title,
        description: input.description,
        policyProfile: input.policyProfile,
        timeoutMs: input.timeoutMs || 60_000,
    };
}
async function updateModuleMap(request) {
    const container = getContainer(request);
    const moduleService = container.get('moduleService');
    const result = await moduleService.updateModuleMap({
        aggressive: request.args.aggressive ?? true,
    });
    logger.info('Module map updated via dashboard operation', { result });
    return result;
}
async function rebuildSemanticIndex(request) {
    const container = getContainer(request);
    const manager = container.singletons?._aiProviderManager;
    if (manager?.isMock) {
        return {
            error: 'Embedding provider 由宿主管理，当前插件未收到可执行 embedding provider，索引重建已跳过。',
            hostManaged: true,
        };
    }
    const clear = request.args.clear !== false;
    const force = Boolean(request.args.force ?? false);
    const vectorService = container.services.vectorService
        ? container.get('vectorService')
        : null;
    let result;
    if (vectorService) {
        if (clear) {
            await vectorService.clear();
        }
        const buildResult = await vectorService.fullBuild({ force });
        result = {
            scanned: buildResult.scanned,
            chunked: buildResult.chunked,
            embedded: buildResult.embedded,
            upserted: buildResult.upserted,
            skipped: buildResult.skipped,
            errors: buildResult.errors,
        };
    }
    else {
        const indexingPipeline = container.get('indexingPipeline');
        result = await indexingPipeline.run({ clear, force });
    }
    logger.info('Semantic index rebuilt via dashboard operation', { result });
    return {
        scanned: result.scanned || 0,
        chunked: result.chunked || 0,
        embedded: result.embedded || 0,
        upserted: result.upserted || 0,
        skipped: result.skipped || 0,
        errors: result.errors || 0,
    };
}
async function scanProject(request) {
    const container = getContainer(request);
    const moduleService = container.get('moduleService');
    await moduleService.load();
    logger.info('Full project scan started via dashboard operation');
    return moduleService.scanProject(request.args.options || {});
}
async function bootstrapProject(request) {
    const container = getContainer(request);
    const { createDaemonJob, runDaemonJob } = await import('../../daemon/DaemonJobRunner.js');
    const args = {
        maxFiles: numberArg(request.args.maxFiles, 500),
        skipGuard: Boolean(request.args.skipGuard || false),
        contentMaxLines: numberArg(request.args.contentMaxLines, 120),
    };
    const job = createDaemonJob({ args, container, kind: 'bootstrap', logger, source: 'dashboard' });
    const result = await runDaemonJob({
        args,
        container,
        jobId: job.id,
        kind: 'bootstrap',
        logger,
        source: 'dashboard',
    });
    return { ...asRecord(result.result), job: result.job, jobId: job.id };
}
async function cancelBootstrap(request) {
    const container = getContainer(request);
    const taskManager = getOptionalService(container, 'bootstrapTaskManager');
    if (!taskManager) {
        return { message: 'No bootstrap task manager initialized' };
    }
    const reason = request.args.reason || 'Cancelled by user via Dashboard';
    if (taskManager.isRunning) {
        taskManager.abortSession(reason);
    }
    else {
        taskManager.markCancelled();
    }
    logger.info('Bootstrap session cancelled via dashboard operation', { reason });
    return taskManager.getSessionStatus();
}
async function rescanProject(request) {
    const container = getContainer(request);
    const { createDaemonJob, runDaemonJob } = await import('../../daemon/DaemonJobRunner.js');
    const args = {
        reason: request.args.reason || 'dashboard-rescan',
        dimensions: Array.isArray(request.args.dimensions)
            ? request.args.dimensions.filter((dimension) => typeof dimension === 'string')
            : undefined,
    };
    logger.info('Rescan initiated via dashboard operation', {
        reason: args.reason,
        dimensions: args.dimensions,
    });
    const job = createDaemonJob({ args, container, kind: 'rescan', logger, source: 'dashboard' });
    const result = await runDaemonJob({
        args,
        container,
        jobId: job.id,
        kind: 'rescan',
        logger,
        source: 'dashboard',
    });
    return { ...asRecord(result.result), job: result.job, jobId: job.id };
}
function getContainer(request) {
    return request.context.services;
}
function getOptionalService(container, name) {
    try {
        return container.get(name);
    }
    catch {
        return null;
    }
}
function asRecord(value) {
    return value && typeof value === 'object' ? value : { value };
}
function numberArg(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
