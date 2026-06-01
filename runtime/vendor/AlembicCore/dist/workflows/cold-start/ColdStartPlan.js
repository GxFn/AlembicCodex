export function buildColdStartWorkflowPlan({ intent, projectRoot, dataRoot, }) {
    const prepare = {
        clearOldData: true,
        ...(intent.executor === 'host-agent' ? { dataRoot } : {}),
    };
    const scan = {
        maxFiles: intent.projectAnalysis.maxFiles,
        contentMaxLines: intent.projectAnalysis.contentMaxLines,
        skipGuard: intent.projectAnalysis.skipGuard,
        sourceTag: intent.projectAnalysis.sourceTag,
        summaryPrefix: intent.projectAnalysis.summaryPrefix,
        generateReport: true,
        generateAstContext: intent.projectAnalysis.generateAstContext,
        incremental: false,
        logPrefix: 'Bootstrap',
    };
    const materialize = {
        codeEntityGraph: true,
        callGraph: true,
        dependencyEdges: true,
        moduleEntities: true,
        guardViolations: true,
        panorama: true,
    };
    return {
        intent,
        cleanup: {
            policy: 'full-reset',
            projectRoot: intent.executor === 'host-agent' ? dataRoot : projectRoot,
            dataRoot,
        },
        projectAnalysis: {
            projectRoot,
            prepare,
            scan,
            materialize,
        },
        response: { tool: 'alembic_bootstrap' },
    };
}
export function selectColdStartDimensions(snapshot, intent) {
    const dimensions = [...snapshot.activeDimensions];
    if (!intent.dimensionIds?.length) {
        return dimensions;
    }
    const requestedIds = new Set(intent.dimensionIds);
    return dimensions.filter((dimension) => requestedIds.has(dimension.id));
}
export function buildColdStartSelectionSummary({ snapshot, intent, selectedDimensions, }) {
    const requestedDimensionIds = intent.dimensionIds ?? [];
    const requestedCounts = new Map();
    for (const id of requestedDimensionIds) {
        requestedCounts.set(id, (requestedCounts.get(id) ?? 0) + 1);
    }
    const uniqueRequestedIds = [...requestedCounts.keys()];
    const duplicateRequestedDimensionIds = [...requestedCounts.entries()]
        .filter(([, count]) => count > 1)
        .map(([id]) => id);
    const activeIds = new Set(snapshot.activeDimensions.map((dimension) => dimension.id));
    const selectedIds = new Set(selectedDimensions.map((dimension) => dimension.id));
    const unknownRequestedDimensionIds = uniqueRequestedIds.filter((id) => !activeIds.has(id));
    const skippedRequestedDimensions = uniqueRequestedIds
        .filter((id) => activeIds.has(id) && !selectedIds.has(id))
        .map((id) => ({ id, reason: 'filtered-after-selection' }));
    return {
        activeCount: snapshot.activeDimensions.length,
        duplicateCollapsedCount: requestedDimensionIds.length - uniqueRequestedIds.length,
        duplicateRequestedDimensionIds,
        requestedCount: requestedDimensionIds.length,
        requestedDimensionIds,
        requestedUniqueCount: uniqueRequestedIds.length,
        selectedCount: selectedDimensions.length,
        selectedDimensionIds: selectedDimensions.map((dimension) => dimension.id),
        skippedRequestedDimensions: [
            ...unknownRequestedDimensionIds.map((id) => ({
                id,
                reason: 'unknown-requested-dimension',
            })),
            ...skippedRequestedDimensions,
        ],
        unknownRequestedDimensionIds,
    };
}
