import type { BootstrapFile, IncrementalPlan } from '../../../types/workflows.js';
import type { MiningSessionStore } from '../execution/external/MiningSessionStore.js';
import { FileDiffPlanner } from '../project-intelligence/FileDiffPlanner.js';
import type { CandidateResults, DimensionStat, WorkflowResultPersistenceContext, WorkflowSnapshotSummary } from './WorkflowReportTypes.js';
export interface SaveWorkflowSnapshotOptions {
    ctx: WorkflowResultPersistenceContext;
    projectRoot: string;
    sessionId: string;
    allFiles: BootstrapFile[] | null;
    dimensionStats: Record<string, DimensionStat>;
    sessionStore: MiningSessionStore;
    totalTimeMs: number;
    candidateResults: CandidateResults;
    primaryLang: string;
    isIncremental?: boolean | null;
    incrementalPlan?: IncrementalPlan | null;
    createFileDiffPlanner: (db: unknown, projectRoot: string) => Pick<FileDiffPlanner, 'saveSnapshot'>;
}
/**
 * 保存 workflow snapshot。
 *
 * 这里仅持有 FileDiffPlanner 写入内核；外层负责决定何时调用、
 * 是否广播事件，以及如何和 internal-agent 恢复流程衔接。
 */
export declare function saveWorkflowSnapshot({ ctx, projectRoot, sessionId, allFiles, dimensionStats, sessionStore, totalTimeMs, candidateResults, primaryLang, isIncremental, incrementalPlan, createFileDiffPlanner, }: SaveWorkflowSnapshotOptions): WorkflowSnapshotSummary;
export declare function createDefaultFileDiffPlanner(db: unknown, projectRoot: string): FileDiffPlanner;
