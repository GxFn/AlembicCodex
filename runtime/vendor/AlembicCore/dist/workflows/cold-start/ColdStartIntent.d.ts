import { type WorkflowExecutor } from '../shared/WorkflowTypes.js';
export type ColdStartExecutor = WorkflowExecutor;
export interface InternalColdStartArgs {
    maxFiles?: number;
    skipGuard?: boolean;
    contentMaxLines?: number;
    incremental?: boolean;
    skipAsyncFill?: boolean;
    skipTargetDelivery?: boolean;
    loadSkills?: boolean;
    dimensions?: string[];
    [key: string]: unknown;
}
export interface ColdStartProjectAnalysisIntent {
    maxFiles: number;
    contentMaxLines: number;
    skipGuard: boolean;
    sourceTag: 'bootstrap' | 'bootstrap-external';
    summaryPrefix?: string;
    generateAstContext: boolean;
}
export interface InternalColdStartExecutionIntent {
    skipAsyncFill: boolean;
    skipTargetDelivery: boolean;
}
export interface ColdStartWorkflowIntent {
    kind: 'cold-start';
    executor: ColdStartExecutor;
    analysisMode: 'full';
    cleanupPolicy: 'full-reset';
    completionPolicy: 'auto-fill' | 'external-dimension-complete';
    projectAnalysis: ColdStartProjectAnalysisIntent;
    dimensionIds?: string[];
    internalExecution?: InternalColdStartExecutionIntent;
    ignoredFileDiffIncremental: boolean;
}
export declare function createInternalColdStartIntent(args?: InternalColdStartArgs): ColdStartWorkflowIntent;
export declare function createExternalColdStartIntent(): ColdStartWorkflowIntent;
