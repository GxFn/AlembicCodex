/**
 * ProjectIntelligenceRunner — 共享 Phase 1-4 项目分析管线
 *
 * 冷启动 (ColdStart) 和增量扫描 (KnowledgeRescan) 共享完全相同的
 * 项目分析逻辑，内部/外部 Agent 均通过 ProjectIntelligenceCapability 调用此模块。
 *
 * Phase 概览:
 *   Phase 1   → 文件收集（DiscovererRegistry → 多语言项目类型检测）
 *   Phase 1.5 → AST 代码结构分析（tree-sitter + SFC 预处理）
 *   Phase 1.6 → Code Entity Graph（代码实体关系图谱）
 *   Phase 2   → 依赖关系 → knowledge_edges
 *   Phase 2.1 → Module 实体写入 Entity Graph
 *   Phase 2.2 → Panorama 全景汇总（RoleRefiner + CouplingAnalyzer + LayerInferrer）
 *   Phase 3   → Guard 规则审计
 *   Phase 4   → 维度条件化过滤 + Enhancement Pack + 语言画像
 */
import type { ProjectAnalysisResult } from '../../../core/AstAnalyzer.js';
import type { CallGraphResult as CallGraphAnalysisResult } from '../../../core/analysis/CallGraphAnalyzer.js';
import type { GuardAudit } from '../../../types/project-snapshot.js';
import { type BaseDimension } from '../planning/dimensions/BaseDimensions.js';
/** Logger with required info/warn (compatible with Logger singleton) */
interface PhaseLogger {
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error?(...args: unknown[]): void;
    debug?(...args: unknown[]): void;
}
/** Minimal DI container shape (extends McpServiceContainer pattern) */
interface PhaseContainer {
    get(name: string): any;
    [key: string]: any;
}
/** Single file entry collected during Phase 1 */
interface BootstrapFileEntry {
    name: string;
    path: string;
    relativePath: string;
    content: string;
    targetName: string;
    /** Whether this file belongs to a test target or matches test file naming patterns */
    isTest: boolean;
}
/** Target item — either a plain string or an object with metadata */
type TargetItem = string | {
    name: string;
    framework?: string;
    type?: string;
    packageName?: string;
    [key: string]: unknown;
};
/** Dependency graph data shape */
interface DepGraphData {
    nodes?: Array<Record<string, unknown>>;
    edges?: Array<{
        from: string;
        to: string;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
}
type AstProjectSummaryLike = ProjectAnalysisResult;
type GuardAuditLike = GuardAudit;
/** Minimal guard engine shape */
interface GuardEngineLike {
    auditFiles(files: Array<{
        path: string;
        content: string;
    }>, opts?: Record<string, unknown>): GuardAuditLike;
    injectExternalRules(rules: unknown[]): void;
    getExternalRuleCount(): number;
    [key: string]: unknown;
}
/** Minimal discoverer shape */
interface DiscovererLike {
    id: string;
    displayName: string;
    load(root: string): Promise<void>;
    listTargets(): Promise<TargetItem[]>;
    getTargetFiles(target: unknown): Promise<Array<string | {
        path: string;
        name?: string;
        relativePath?: string;
    }>>;
    getDependencyGraph(): Promise<DepGraphData>;
    [key: string]: unknown;
}
/** Phase 4 dimension resolve params */
interface Phase4Params {
    primaryLang: string;
    langStats: Record<string, number>;
    allTargets: TargetItem[];
    astProjectSummary: AstProjectSummaryLike | null;
    guardEngine: GuardEngineLike | null;
    allFiles: BootstrapFileEntry[];
    logger: PhaseLogger;
}
/** Phase 1 options */
interface Phase1Options {
    maxFiles?: number;
    [key: string]: unknown;
}
/** Phase 1.5 AST analysis options */
interface AstAnalysisOptions {
    generateAstContext?: boolean;
    [key: string]: unknown;
}
/** Phase 1.7 incremental call graph options */
interface IncrementalCallGraphOpts {
    changedFiles?: string[];
    materialize?: boolean;
    [key: string]: unknown;
}
interface CallGraphAnalysisOptions {
    changedFiles?: string[];
    [key: string]: unknown;
}
interface CallGraphMaterializationResult {
    entitiesUpserted: number;
    edgesCreated: number;
    durationMs: number;
}
interface CodeEntityGraphCallGraphLike {
    clearCallGraphForFiles(filePaths: string[] | null): Promise<unknown>;
    populateCallGraph(callEdges: CallGraphAnalysisResult['callEdges'], dataFlowEdges: CallGraphAnalysisResult['dataFlowEdges']): Promise<CallGraphMaterializationResult>;
}
type CodeEntityGraphCallGraphConstructor = new (entityRepo: unknown, edgeRepo: unknown, options: {
    projectRoot: string;
}) => CodeEntityGraphCallGraphLike;
/** Phase 3 Guard audit options */
interface GuardAuditOptions {
    skipGuard?: boolean;
    summaryPrefix?: string;
    writeViolations?: boolean;
    [key: string]: unknown;
}
/** runAllPhases context — callers pass McpContext variants with different shapes */
interface AllPhasesContext {
    container: PhaseContainer;
    logger: PhaseLogger;
    [key: string]: any;
}
/** runAllPhases options */
interface AllPhasesOptions {
    incremental?: boolean;
    generateReport?: boolean;
    clearOldData?: boolean;
    generateAstContext?: boolean;
    materialize?: ProjectAnalysisMaterializationInput;
    maxFiles?: number;
    skipGuard?: boolean;
    sourceTag?: string;
    summaryPrefix?: string;
    dataRoot?: string;
    /** Log prefix for phase messages (default: 'Bootstrap'). Use 'Rescan' for incremental scans. */
    logPrefix?: string;
    [key: string]: unknown;
}
/** Phase report structure */
export interface PhaseReport {
    phases: Record<string, Record<string, unknown>>;
    startTime: number;
    totalMs?: number;
    [key: string]: unknown;
}
export interface ProjectAnalysisMaterializationOptions {
    codeEntityGraph: boolean;
    callGraph: boolean;
    dependencyEdges: boolean;
    moduleEntities: boolean;
    guardViolations: boolean;
    panorama: boolean;
}
export type ProjectAnalysisMaterializationInput = boolean | Partial<ProjectAnalysisMaterializationOptions>;
export declare const DEFAULT_PROJECT_ANALYSIS_MATERIALIZATION: ProjectAnalysisMaterializationOptions;
export declare function resolveProjectAnalysisMaterialization(input: ProjectAnalysisMaterializationInput | undefined): ProjectAnalysisMaterializationOptions;
/** 判断文件是否为 Alembic 生成物（用于排除自引用循环知识） */
export declare function isAlembicGenerated(filePath: string): boolean;
/**
 * Phase 1: 通过 DiscovererRegistry 检测项目类型并收集源文件
 *
 * @param projectRoot 项目根目录
 * @returns >}
 */
export declare function runPhase1_FileCollection(projectRoot: string, logger: PhaseLogger, options?: Phase1Options): Promise<{
    allFiles: BootstrapFileEntry[];
    allTargets: TargetItem[];
    discoverer: DiscovererLike;
    langStats: Record<string, number>;
    truncated: boolean;
}>;
/**
 * Phase 1.5: tree-sitter AST 分析
 *   - 1.5a: 按需安装缺失的语法包
 *   - 1.5b: 执行 AST 分析 + SFC 预处理
 *
 * @param allFiles Phase 1 收集的文件
 * @param langStats 语言统计
 * @param [options.generateAstContext=false] 是否生成 astContext 文本
 * @returns >}
 */
export declare function runPhase1_5_AstAnalysis(allFiles: BootstrapFileEntry[], langStats: Record<string, number>, logger: PhaseLogger, options?: AstAnalysisOptions): Promise<{
    astProjectSummary: ProjectAnalysisResult | null;
    astContext: string;
    warnings: string[];
}>;
export interface ProjectEntityGraphInput {
    astProjectSummary: AstProjectSummaryLike;
    projectRoot: string;
}
export interface EntityGraphMaterializationOptions {
    materialize?: boolean;
}
export declare function buildEntityGraphInput(astProjectSummary: AstProjectSummaryLike | null, projectRoot: string): ProjectEntityGraphInput | null;
export declare function materializeEntityGraph(input: ProjectEntityGraphInput, container: PhaseContainer, logger: PhaseLogger): Promise<{
    codeEntityResult: {
        entitiesUpserted: number;
        edgesCreated: number;
        durationMs: number;
    } | null;
    warnings: string[];
}>;
/**
 * Phase 1.6: 从 AST 结果构建代码实体关系图谱
 *
 * @param astProjectSummary AST 分析结果
 * @param container ServiceContainer
 * @returns >}
 */
export declare function runPhase1_6_EntityGraph(astProjectSummary: AstProjectSummaryLike | null, projectRoot: string, container: PhaseContainer, logger: PhaseLogger, options?: EntityGraphMaterializationOptions): Promise<{
    codeEntityResult: {
        entitiesUpserted: number;
        edgesCreated: number;
        durationMs: number;
    } | null;
    warnings: string[];
}>;
/**
 * Phase 1.7: 跨文件调用图分析 (Phase 5)
 *
 * 从 AST 的 callSites 构建全局调用图并写入 CodeEntityGraph。
 *
 * @param astProjectSummary AST 分析结果 (含 fileSummaries[].callSites)
 * @param container ServiceContainer
 * @param [incrementalOpts] 增量分析选项
 * @param [incrementalOpts.changedFiles] 变更文件的相对路径
 * @returns >}
 */
export declare function runPhase1_7_CallGraph(astProjectSummary: AstProjectSummaryLike | null, projectRoot: string, container: PhaseContainer, logger: PhaseLogger, incrementalOpts?: IncrementalCallGraphOpts | null): Promise<{
    callGraphResult: null;
    callGraphAnalysis: CallGraphAnalysisResult | null;
    warnings: string[];
} | {
    callGraphResult: CallGraphMaterializationResult | null;
    callGraphAnalysis: CallGraphAnalysisResult;
    warnings: string[];
}>;
export declare function analyzeProjectCallGraph(astProjectSummary: AstProjectSummaryLike | null, projectRoot: string, logger: PhaseLogger, options?: CallGraphAnalysisOptions): Promise<{
    callGraphAnalysis: CallGraphAnalysisResult | null;
    warnings: string[];
}>;
export declare function materializeCallGraph({ callGraphAnalysis, projectRoot, container, logger, changedFiles, getCodeEntityGraphClass, }: {
    callGraphAnalysis: CallGraphAnalysisResult | null;
    projectRoot: string;
    container: PhaseContainer;
    logger: PhaseLogger;
    changedFiles?: string[];
    getCodeEntityGraphClass?: () => Promise<CodeEntityGraphCallGraphConstructor>;
}): Promise<{
    callGraphResult: CallGraphMaterializationResult | null;
    warnings: string[];
}>;
export interface DependencyEdgeMaterializationOptions {
    materializeEdges?: boolean;
}
export declare function collectDependencyGraph(discoverer: DiscovererLike, logger: PhaseLogger): Promise<{
    depGraphData: DepGraphData | null;
    warnings: string[];
}>;
export declare function writeDependencyEdges({ depGraphData, discoverer, container, logger, sourceTag, }: {
    depGraphData: DepGraphData | null;
    discoverer: DiscovererLike;
    container: PhaseContainer;
    logger: PhaseLogger;
    sourceTag: string;
}): Promise<{
    depEdgesWritten: number;
    warnings: string[];
}>;
/**
 * Phase 2: 获取依赖图并写入 knowledge_edges
 *
 * @param discoverer DiscovererRegistry 检测到的 discoverer
 * @param container ServiceContainer
 * @param [sourceTag='bootstrap'] edge 的 source 标签后缀
 * @returns >}
 */
export declare function runPhase2_DependencyGraph(discoverer: DiscovererLike, container: PhaseContainer, logger: PhaseLogger, sourceTag?: string, options?: DependencyEdgeMaterializationOptions): Promise<{
    depGraphData: DepGraphData | null;
    depEdgesWritten: number;
    warnings: string[];
}>;
export interface ModuleEntityMaterializationOptions {
    materialize?: boolean;
}
/**
 * Phase 2.1: 将依赖图的 module 节点写入 Code Entity Graph
 *
 * @param depGraphData 依赖图数据
 */
export declare function materializeModuleEntities(depGraphData: DepGraphData | null, projectRoot: string, container: PhaseContainer, logger: PhaseLogger): Promise<void>;
export declare function runPhase2_1_ModuleEntities(depGraphData: DepGraphData | null, projectRoot: string, container: PhaseContainer, logger: PhaseLogger, options?: ModuleEntityMaterializationOptions): Promise<void>;
/**
 * Phase 3: Guard 规则审计
 *
 * @param allFiles Phase 1 收集的文件
 * @param [options.summaryPrefix='Bootstrap scan'] - ViolationsStore 摘要前缀
 * @returns >}
 */
export declare function runGuardAudit(allFiles: BootstrapFileEntry[], container: PhaseContainer, logger: PhaseLogger): Promise<{
    guardAudit: GuardAudit | null;
    guardEngine: GuardEngineLike | null;
    warnings: string[];
}>;
export declare function writeGuardViolations({ guardAudit, container, summaryPrefix, }: {
    guardAudit: GuardAuditLike | null;
    container: PhaseContainer;
    summaryPrefix?: string;
}): void;
export declare function runPhase3_GuardAudit(allFiles: BootstrapFileEntry[], container: PhaseContainer, logger: PhaseLogger, options?: GuardAuditOptions): Promise<{
    guardAudit: GuardAudit | null;
    guardEngine: GuardEngineLike | null;
    warnings: string[];
}>;
/**
 * Phase 4: 维度条件化过滤 + Enhancement Pack 动态追加 + 语言画像 + Skill 增强
 *
 * @param params.astProjectSummary AST 结果（供 Enhancement Pack 模式检测）
 * @param params.guardEngine Guard 引擎（供 Enhancement Pack 规则注入）
 * @param params.allFiles 文件列表（供 Guard 二次审计）
 * @returns {Promise<{
 *   activeDimensions: Array,
 *   enhancementPackInfo: Array,
 *   enhancementPatterns: Array,
 *   enhancementGuardRules: Array,
 *   langProfile: object,
 *   detectedFrameworks: string[],
 *   guardAudit: object|null
 * }>}
 */
export declare function runPhase4_DimensionResolve(params: Phase4Params): Promise<{
    activeDimensions: BaseDimension[];
    enhancementPackInfo: {
        id: string;
        displayName: string;
    }[];
    enhancementPatterns: Record<string, unknown>[];
    enhancementGuardRules: unknown[];
    langProfile: {
        primary: string;
        secondary: string[];
        all: {
            ratio: number;
            lang: string;
            count: number;
        }[];
        totalFiles: number;
        isMultiLang: boolean;
    };
    detectedFrameworks: string[];
    guardAudit: GuardAudit | null;
}>;
export declare function materializeProjectPanorama({ container, logger, report, }: {
    container: PhaseContainer;
    logger: PhaseLogger;
    report: PhaseReport | null;
}): Promise<{
    panoramaResult: Record<string, unknown> | null;
    warnings: string[];
}>;
/**
 * runAllPhases — 一站式执行 Phase 1~4 全部数据收集
 *
 * 内部 Agent 和外部 Agent 均可调用此函数获取统一的分析结果。
 *
 * @param projectRoot 项目根目录
 * @param ctx { container, logger }
 * @param [options.incremental=false] 启用增量评估 (Phase 1 后执行)
 * @param [options.generateReport=false] 生成 Phase 级详细报告
 * @param [options.clearOldData=false] 先清除旧 checkpoints/snapshots
 * @param [options.generateAstContext=false] 生成 astContext 文本
 * @param [options.summaryPrefix='Bootstrap scan']
 */
export declare function runAllPhases(projectRoot: string, ctx: AllPhasesContext, options?: AllPhasesOptions): Promise<{
    allFiles: BootstrapFileEntry[];
    langStats: Record<string, number>;
    primaryLang: null;
    discoverer: DiscovererLike;
    allTargets: TargetItem[];
    truncated: boolean;
    astProjectSummary: null;
    astContext: string;
    codeEntityResult: null;
    callGraphResult: null;
    depGraphData: null;
    depEdgesWritten: number;
    guardAudit: null;
    guardEngine: null;
    activeDimensions: never[];
    enhancementPackInfo: never[];
    enhancementPatterns: never[];
    enhancementGuardRules: never[];
    langProfile: {};
    targetsSummary: never[];
    localPackageModules: never[];
    warnings: string[];
    report: {};
    incrementalPlan: null;
    panoramaResult: null;
    detectedFrameworks: never[];
    isEmpty: boolean;
} | {
    allFiles: BootstrapFileEntry[];
    langStats: Record<string, number>;
    primaryLang: string;
    discoverer: DiscovererLike;
    allTargets: TargetItem[];
    truncated: boolean;
    astProjectSummary: ProjectAnalysisResult | null;
    astContext: string;
    codeEntityResult: {
        entitiesUpserted: number;
        edgesCreated: number;
        durationMs: number;
    } | null;
    callGraphResult: CallGraphMaterializationResult | null;
    depGraphData: DepGraphData | null;
    depEdgesWritten: number;
    guardAudit: GuardAudit | null;
    guardEngine: GuardEngineLike | null;
    activeDimensions: BaseDimension[];
    enhancementPackInfo: {
        id: string;
        displayName: string;
    }[];
    enhancementPatterns: Record<string, unknown>[];
    enhancementGuardRules: unknown[];
    langProfile: {
        primary: string;
        secondary: string[];
        all: {
            ratio: number;
            lang: string;
            count: number;
        }[];
        totalFiles: number;
        isMultiLang: boolean;
    };
    detectedFrameworks: string[];
    targetsSummary: import("./ProjectIntelligenceResultProjection.js").ProjectAnalysisTargetSummary[];
    localPackageModules: import("./ProjectIntelligenceResultProjection.js").ProjectAnalysisLocalPackageModule[];
    warnings: string[];
    report: PhaseReport | null;
    incrementalPlan: import("../../../types/workflows.js").FileDiffPlan | null;
    panoramaResult: Record<string, unknown> | null;
    isEmpty: boolean;
}>;
export {};
