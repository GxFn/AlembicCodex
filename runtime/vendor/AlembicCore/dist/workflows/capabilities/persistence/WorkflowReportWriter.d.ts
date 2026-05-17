import type { IncrementalPlan } from '../../../types/workflows.js';
import type { CandidateResults, DimensionStat, PersistWorkflowResultOptions, SkillResults, WorkflowCompletionSummary, WorkflowReport, WorkflowReportConsolidationResult, WorkflowSnapshotSummary } from './WorkflowReportTypes.js';
export declare function writeWorkflowReport({ ctx, dataRoot, sessionId, projectRoot, projectInfo, dimensionStats, candidateResults, skillResults, consolidationResult, completionSummary, snapshotSummary, skippedDims, incrementalSkippedDims, isIncremental, incrementalPlan, totalTimeMs, totalTokenUsage, totalToolCalls, }: Omit<PersistWorkflowResultOptions, 'allFiles' | 'sessionStore' | 'enableParallel' | 'concurrency' | 'startedAtMs'> & {
    snapshotSummary?: WorkflowSnapshotSummary | null;
    totalTimeMs: number;
    totalTokenUsage: {
        input: number;
        output: number;
    };
    totalToolCalls: number;
}): Promise<WorkflowReport | null>;
export declare function buildWorkflowReport({ sessionId, projectInfo, dimensionStats, candidateResults, skillResults, consolidationResult, completionSummary, snapshotSummary, skippedDims, incrementalSkippedDims, isIncremental, incrementalPlan, totalTimeMs, totalTokenUsage, totalToolCalls, }: {
    sessionId?: string;
    projectInfo: {
        name: string;
        fileCount: number;
        lang: string;
    };
    dimensionStats: Record<string, DimensionStat>;
    candidateResults: CandidateResults;
    skillResults: SkillResults;
    consolidationResult: WorkflowReportConsolidationResult | null;
    completionSummary?: WorkflowCompletionSummary | null;
    snapshotSummary?: WorkflowSnapshotSummary | null;
    skippedDims: string[];
    incrementalSkippedDims: string[];
    isIncremental?: boolean | null;
    incrementalPlan?: IncrementalPlan | null;
    totalTimeMs: number;
    totalTokenUsage: {
        input: number;
        output: number;
    };
    totalToolCalls: number;
}): WorkflowReport;
