import { type WorkflowExecutor } from '../shared/WorkflowTypes.js';
export type KnowledgeRescanExecutor = WorkflowExecutor;
export interface RescanInput {
    force?: boolean;
    dimensions?: unknown;
    reason?: string | null;
    [key: string]: unknown;
}
export interface InternalKnowledgeRescanArgs extends RescanInput {
    skipAsyncFill?: boolean;
}
export interface KnowledgeRescanProjectAnalysisIntent {
    maxFiles: number;
    contentMaxLines: number;
    sourceTag: 'rescan-internal' | 'rescan-external';
    summaryPrefix: string;
    generateAstContext: boolean;
}
export interface InternalKnowledgeRescanExecutionIntent {
    skipAsyncFill: boolean;
}
export interface KnowledgeRescanWorkflowIntent {
    kind: 'knowledge-rescan';
    executor: KnowledgeRescanExecutor;
    analysisMode: 'incremental' | 'full';
    cleanupPolicy: 'none' | 'force-rescan' | 'rescan-clean';
    completionPolicy: 'auto-fill' | 'external-dimension-complete';
    projectAnalysis: KnowledgeRescanProjectAnalysisIntent;
    dimensionIds?: string[];
    reason?: string | null;
    internalExecution?: InternalKnowledgeRescanExecutionIntent;
}
export declare function createInternalKnowledgeRescanIntent(args: InternalKnowledgeRescanArgs): KnowledgeRescanWorkflowIntent;
export declare function createExternalKnowledgeRescanIntent(args: RescanInput): KnowledgeRescanWorkflowIntent;
