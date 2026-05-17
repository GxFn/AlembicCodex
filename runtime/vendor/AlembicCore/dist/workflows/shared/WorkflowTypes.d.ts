/**
 * WorkflowTypes — 冷启动 & 增量扫描管线共享类型和工具函数
 *
 * 消除 ColdStartIntent / KnowledgeRescanIntent / InternalColdStartWorkflow /
 * InternalKnowledgeRescanWorkflow 等文件中的重复定义。
 *
 * @module workflows/shared/WorkflowTypes
 */
export interface WorkflowLogger {
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error?(...args: unknown[]): void;
    debug?(...args: unknown[]): void;
}
export interface WorkflowMcpContext {
    container: {
        get(name: string): unknown;
    };
    logger: WorkflowLogger;
}
export declare function normalizeDimensionIds(dimensions: unknown): string[] | undefined;
export declare function normalizeStringArray(values: unknown): string[] | undefined;
export type WorkflowExecutor = 'internal-agent' | 'external-agent';
export type WorkflowAnalysisMode = 'full' | 'incremental';
