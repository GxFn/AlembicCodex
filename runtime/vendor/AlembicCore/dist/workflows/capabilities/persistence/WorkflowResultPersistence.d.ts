import type { DimensionStat, PersistWorkflowResultOptions, WorkflowResultPersistenceResult } from './WorkflowReportTypes.js';
export declare function persistWorkflowResult({ ctx, dataRoot, projectRoot, projectInfo, sessionId, allFiles, sessionStore, dimensionStats, candidateResults, skillResults, consolidationResult, completionSummary, skippedDims, incrementalSkippedDims, isIncremental, incrementalPlan, enableParallel, concurrency, startedAtMs, createFileDiffPlanner, }: PersistWorkflowResultOptions): Promise<WorkflowResultPersistenceResult>;
export declare function summarizeWorkflowDimensionStats(dimensionStats: Record<string, DimensionStat>): {
    totalTokenUsage: {
        input: number;
        output: number;
    };
    totalToolCalls: number;
};
