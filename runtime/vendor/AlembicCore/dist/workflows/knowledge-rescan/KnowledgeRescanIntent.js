import { normalizeDimensionIds } from '../shared/WorkflowTypes.js';
export const DEFAULT_KNOWLEDGE_RESCAN_MAX_FILES = 500;
export const DEFAULT_KNOWLEDGE_RESCAN_CONTENT_MAX_LINES = 120;
export const MAX_KNOWLEDGE_RESCAN_MAX_FILES = 20_000;
export const MAX_KNOWLEDGE_RESCAN_CONTENT_MAX_LINES = 2_000;
export function createInternalKnowledgeRescanIntent(args) {
    const forceMode = args.force ?? false;
    const cleanupPolicy = forceMode ? 'force-rescan' : 'rescan-clean';
    const analysisOptions = resolveKnowledgeRescanAnalysisOptions(args);
    return {
        kind: 'knowledge-rescan',
        executor: 'internal-agent',
        analysisMode: forceMode ? 'full' : 'incremental',
        cleanupPolicy,
        completionPolicy: 'auto-fill',
        projectAnalysis: {
            maxFiles: analysisOptions.maxFiles,
            contentMaxLines: analysisOptions.contentMaxLines,
            sourceTag: 'rescan-internal',
            summaryPrefix: 'Rescan-Internal scan',
            generateAstContext: true,
        },
        dimensionIds: normalizeDimensionIds(args.dimensions),
        reason: args.reason || null,
        internalExecution: {
            skipAsyncFill: args.skipAsyncFill ?? false,
        },
    };
}
export function createHostAgentKnowledgeRescanIntent(args) {
    const forceMode = args.force ?? false;
    const cleanupPolicy = forceMode ? 'force-rescan' : 'rescan-clean';
    const analysisOptions = resolveKnowledgeRescanAnalysisOptions(args);
    return {
        kind: 'knowledge-rescan',
        executor: 'host-agent',
        analysisMode: forceMode ? 'full' : 'incremental',
        cleanupPolicy,
        completionPolicy: 'host-agent-dimension-complete',
        projectAnalysis: {
            maxFiles: analysisOptions.maxFiles,
            contentMaxLines: analysisOptions.contentMaxLines,
            sourceTag: 'rescan-host-agent',
            summaryPrefix: 'Rescan scan',
            generateAstContext: false,
        },
        dimensionIds: normalizeDimensionIds(args.dimensions),
        reason: args.reason || null,
    };
}
function resolveKnowledgeRescanAnalysisOptions(input) {
    return {
        maxFiles: normalizeKnowledgeRescanPositiveInteger(input.maxFiles, {
            defaultValue: DEFAULT_KNOWLEDGE_RESCAN_MAX_FILES,
            maxValue: MAX_KNOWLEDGE_RESCAN_MAX_FILES,
        }),
        contentMaxLines: normalizeKnowledgeRescanPositiveInteger(input.contentMaxLines, {
            defaultValue: DEFAULT_KNOWLEDGE_RESCAN_CONTENT_MAX_LINES,
            maxValue: MAX_KNOWLEDGE_RESCAN_CONTENT_MAX_LINES,
        }),
    };
}
function normalizeKnowledgeRescanPositiveInteger(value, { defaultValue, maxValue, }) {
    const numericValue = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim().length > 0
            ? Number(value)
            : null;
    if (numericValue === null || !Number.isFinite(numericValue) || numericValue <= 0) {
        return defaultValue;
    }
    // consumer 只能表达“想要更大扫描预算”；Core 统一负责取整和上限裁剪，避免外层各自定义边界。
    return Math.min(Math.floor(numericValue), maxValue);
}
// normalizeDimensionIds → imported from WorkflowTypes
