/**
 * @module CallGraphAnalyzer
 * @description Phase 5: 顶层编排器 - 协调 Call Graph 分析的全流程
 *
 * 流水线:
 *   1. CallSiteExtractor  — 从 AST 提取调用点 (已在 AstAnalyzer 二次遍历中完成)
 *   2. SymbolTableBuilder  — 构建全局符号表
 *   3. ImportPathResolver  — 导入路径解析器
 *   4. CallEdgeResolver    — 调用点 → 调用边
 *   5. DataFlowInferrer    — 调用边 → 数据流边
 *
 * 输出:
 *   { callEdges, dataFlowEdges, stats }
 */
import { type ResolvedEdge } from './CallEdgeResolver.js';
export interface FileSummary {
    file: string;
    callSites?: CallSite[];
    exports?: Array<string | {
        name?: string;
        text?: string;
    }>;
    classes?: Array<{
        name?: string;
        line?: number;
        kind?: string;
    }>;
    protocols?: Array<{
        name?: string;
        line?: number;
    }>;
    methods?: Array<{
        name?: string;
        className?: string;
        line?: number;
    }>;
    imports?: unknown[];
    properties?: Array<{
        name: string;
        className?: string;
        typeAnnotation?: string;
    }>;
    [key: string]: unknown;
}
export interface AstProjectSummary {
    fileSummaries: FileSummary[];
    inheritanceGraph?: Array<{
        from: string;
        to: string;
        type: string;
    }>;
    [key: string]: unknown;
}
export interface AnalyzeOptions {
    timeout?: number;
    maxCallSitesPerFile?: number;
    minConfidence?: number;
}
export interface CallGraphStats {
    totalCallSites: number;
    resolvedCallSites: number;
    resolvedRate: number;
    totalEdges: number;
    filesProcessed: number;
    symbolCount: number;
    durationMs: number;
    tier?: string;
    partial?: boolean;
    incremental?: boolean;
    processedFiles?: number;
    totalFiles?: number;
    changedFiles?: number;
    affectedFiles?: number;
}
export interface CallGraphResult {
    callEdges: ResolvedEdge[];
    dataFlowEdges: DataFlowEdge[];
    stats: CallGraphStats;
}
interface CallSite {
    callee: string;
    callerMethod: string;
    callerClass: string | null;
    callType: string;
    receiver: string | null;
    receiverType: string | null;
    argCount: number;
    line: number;
    isAwait: boolean;
    [key: string]: unknown;
}
type DataFlowEdge = import('./DataFlowInferrer.js').DataFlowEdge;
export declare class CallGraphAnalyzer {
    projectRoot: string;
    constructor(projectRoot: string);
    /**
     * 执行完整的调用图分析
     *
     * @param astProjectSummary analyzeProject() 的输出 (需包含 callSites)
     */
    analyze(astProjectSummary: AstProjectSummary, options?: AnalyzeOptions): Promise<CallGraphResult>;
    /**
     * 增量分析 — 仅重新分析变更文件及其依赖方
     *
     * @param astProjectSummary analyzeProject() 的全量输出
     * @param changedFiles 变更文件的相对路径列表
     */
    analyzeIncremental(astProjectSummary: AstProjectSummary, changedFiles: string[], options?: AnalyzeOptions): Promise<CallGraphResult>;
    /**
     * 实际分析逻辑
     *
     * 分级降级策略 (§5.2):
     *   - <100 文件  → 完整分析 (含 CHA)
     *   - 100-500   → 完整分析，禁用 CHA
     *   - 500-2000  → 抽样分析 (核心目录优先)
     *   - >2000     → 仅模块级 import graph (跳过调用边解析)
     *
     * 渐进式超时 (§13 Issue #15):
     *   每处理完一个文件检查 deadline，超时时返回已有的 partial result
     *
     * @param deadline Date.now() + timeout
     */
    private _doAnalyze;
    /** 空结果 */
    private _emptyResult;
}
export default CallGraphAnalyzer;
