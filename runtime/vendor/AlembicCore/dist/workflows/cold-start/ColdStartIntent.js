import { normalizeDimensionIds } from '../shared/WorkflowTypes.js';
export function createInternalColdStartIntent(args = {}) {
    return {
        kind: 'cold-start',
        executor: 'internal-agent',
        analysisMode: 'full',
        cleanupPolicy: 'full-reset',
        completionPolicy: 'auto-fill',
        projectAnalysis: {
            maxFiles: args.maxFiles ?? 500,
            contentMaxLines: args.contentMaxLines ?? 120,
            skipGuard: args.skipGuard ?? false,
            sourceTag: 'bootstrap',
            generateAstContext: true,
        },
        dimensionIds: normalizeDimensionIds(args.dimensions),
        internalExecution: {
            skipAsyncFill: args.skipAsyncFill ?? false,
            skipTargetDelivery: args.skipTargetDelivery ?? false,
        },
        ignoredFileDiffIncremental: args.incremental === true,
    };
}
export function createHostAgentColdStartIntent() {
    return {
        kind: 'cold-start',
        executor: 'host-agent',
        analysisMode: 'full',
        cleanupPolicy: 'full-reset',
        completionPolicy: 'host-agent-dimension-complete',
        projectAnalysis: {
            maxFiles: 500,
            contentMaxLines: 120,
            skipGuard: false,
            sourceTag: 'bootstrap-host-agent',
            summaryPrefix: 'Bootstrap host-agent scan',
            generateAstContext: false,
        },
        ignoredFileDiffIncremental: false,
    };
}
// normalizeDimensionIds, normalizeStringArray → imported from WorkflowTypes
