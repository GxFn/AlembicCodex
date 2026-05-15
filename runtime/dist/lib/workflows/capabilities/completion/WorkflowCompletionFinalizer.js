import Logger from '#infra/logging/Logger.js';
import { consolidateSemanticMemory, generateWiki, refreshPanorama, } from '#workflows/capabilities/completion/CompletionSteps.js';
const logger = Logger.getInstance();
export async function runWorkflowCompletionFinalizer({ ctx, session, projectRoot, dataRoot, log = logger, dependencies = {}, semanticMemory = {}, steps = {}, shouldAbort, }) {
    const getServiceContainer = dependencies.getServiceContainer ?? defaultGetServiceContainer;
    const scheduleTask = dependencies.scheduleTask ?? defaultScheduleTask;
    const semanticMemoryMode = semanticMemory.mode ?? 'scheduled';
    const panoramaMode = steps.panorama ?? 'run';
    const wikiMode = steps.wiki ?? 'schedule';
    if (shouldAbort?.()) {
        log.info('[CompletionFinalizer] Aborted before panorama — user cancelled');
        return {
            semanticMemoryResult: null,
            wikiStatus: 'skipped',
            panoramaStatus: 'skipped',
        };
    }
    let panoramaStatus = 'skipped';
    if (panoramaMode === 'run') {
        await refreshPanorama({ getServiceContainer, log });
        panoramaStatus = 'completed';
    }
    else {
        log.info('[CompletionFinalizer] Panorama refresh skipped by workflow option');
    }
    if (shouldAbort?.()) {
        log.info('[CompletionFinalizer] Aborted before wiki/memory — user cancelled');
        return {
            semanticMemoryResult: null,
            wikiStatus: 'skipped',
            panoramaStatus,
        };
    }
    let wikiStatus = 'skipped';
    if (wikiMode === 'schedule') {
        scheduleTask(() => generateWiki({ getServiceContainer, projectRoot, log }));
        wikiStatus = 'scheduled';
    }
    else {
        log.info('[CompletionFinalizer] Wiki generation skipped by workflow option');
    }
    let semanticMemoryResult = null;
    if (semanticMemoryMode === 'immediate') {
        if (!shouldAbort?.()) {
            semanticMemoryResult = await consolidateSemanticMemory({ ctx, session, dataRoot, log });
        }
    }
    else if (semanticMemoryMode === 'scheduled') {
        if (!shouldAbort?.()) {
            scheduleTask(async () => {
                await consolidateSemanticMemory({ ctx, session, dataRoot, log });
            });
        }
    }
    return { semanticMemoryResult, wikiStatus, panoramaStatus };
}
async function defaultGetServiceContainer() {
    const { getServiceContainer } = await import('#inject/ServiceContainer.js');
    return getServiceContainer();
}
function defaultScheduleTask(task) {
    setImmediate(() => {
        task().catch((err) => {
            logger.warn(`[DimensionComplete] Scheduled completion task failed (non-blocking): ${err instanceof Error ? err.message : String(err)}`);
        });
    });
}
