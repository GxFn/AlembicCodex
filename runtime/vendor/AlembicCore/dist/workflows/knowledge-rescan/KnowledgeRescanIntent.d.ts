import { type WorkflowExecutor } from '../shared/WorkflowTypes.js';
export type KnowledgeRescanExecutor = WorkflowExecutor;
export declare const DEFAULT_KNOWLEDGE_RESCAN_MAX_FILES = 500;
export declare const DEFAULT_KNOWLEDGE_RESCAN_CONTENT_MAX_LINES = 120;
export declare const MAX_KNOWLEDGE_RESCAN_MAX_FILES = 20000;
export declare const MAX_KNOWLEDGE_RESCAN_CONTENT_MAX_LINES = 2000;
export interface RescanInput {
    force?: boolean;
    dimensions?: unknown;
    maxFiles?: unknown;
    contentMaxLines?: unknown;
    reason?: string | null;
    [key: string]: unknown;
}
export interface InternalKnowledgeRescanArgs extends RescanInput {
    skipAsyncFill?: boolean;
}
export interface KnowledgeRescanProjectAnalysisIntent {
    maxFiles: number;
    contentMaxLines: number;
    sourceTag: 'rescan-internal' | 'rescan-host-agent';
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
    completionPolicy: 'auto-fill' | 'host-agent-dimension-complete';
    projectAnalysis: KnowledgeRescanProjectAnalysisIntent;
    dimensionIds?: string[];
    reason?: string | null;
    internalExecution?: InternalKnowledgeRescanExecutionIntent;
}
export declare function createInternalKnowledgeRescanIntent(args: InternalKnowledgeRescanArgs): KnowledgeRescanWorkflowIntent;
export declare function createHostAgentKnowledgeRescanIntent(args: RescanInput): KnowledgeRescanWorkflowIntent;
