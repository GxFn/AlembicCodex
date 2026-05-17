/**
 * Mission Briefing 构建器 — 外部 Agent 驱动 Bootstrap 的核心数据构建
 *
 * 将 Phase 1-4 的分析结果（AST / EntityGraph / DepGraph / Guard）
 * + 维度定义 + 提交规范 + 执行计划 整合为一站式 Mission Briefing，
 * 让外部 Agent (Cursor/Copilot) 拥有全部必要上下文来完成代码分析。
 *
 * 设计原则：
 *   - 100KB 响应硬上限，大项目自动降级压缩
 *   - 文件内容永远不包含 → Agent 自己读更快
 *   - Example 按项目主语言自适应
 *   - Tier 编号使用 1/2/3（与 tier-scheduler.js 一致）
 *
 * @module bootstrap/MissionBriefingBuilder
 */
import type { AstSummary, CallGraphResult, CodeEntityGraphResult, DependencyGraph, DimensionDef, GuardAudit, IncrementalPlan, LocalPackageModule } from '../../../../types/project-snapshot.js';
import { type BriefingProfile, type RescanBriefingInput, type ResponseBudget } from './MissionBriefingSupport.js';
/** Guard rule 聚合条目 */
interface RuleMapEntry {
    ruleId: string;
    count: number;
    example: string | null;
}
/** 维度任务 (enrichDimensionTask 返回值) */
interface DimensionTask {
    id: string;
    label?: string;
    tier: number;
    outputType: string;
    status: string;
    analysisGuide: string | Record<string, unknown>;
    submissionSpec: {
        preSubmitChecklist?: Record<string, unknown>;
        [key: string]: unknown;
    };
    skillMeta?: {
        name: string;
        description: string;
        format: string;
    };
    evidenceStarters?: Record<string, {
        hint: string;
        data: unknown;
    }>;
}
/** Target 信息 */
interface TargetInfo {
    name: string;
    type?: string;
    inferredRole?: string;
    fileCount?: number;
}
/** 压缩后的协议 */
interface CompressedProtocol {
    name: string;
    file?: string | null;
    methodCount: number;
    conformers?: string[];
}
/** 压缩后的 AST 类 */
interface CompressedAstClass {
    name: string;
    kind?: string;
    superclass?: string | null;
    file?: string | null;
    methodCount: number;
    protocols?: string[];
}
/** Mission Briefing 结构 */
interface MissionBriefing {
    projectMeta: Record<string, unknown>;
    ast: {
        available: boolean;
        compressionLevel?: string;
        summary?: string | {
            text: string;
            kindDistribution: Record<string, number>;
            insight: string;
        };
        classes: CompressedAstClass[];
        protocols: CompressedProtocol[];
        categories?: {
            baseClass?: string;
            name: string;
            file?: string | null;
            methods: string[];
        }[];
        patterns?: Record<string, unknown>;
        metrics?: {
            totalMethods?: number;
            avgMethodsPerClass?: number;
            maxNestingDepth?: number;
            complexMethods?: number;
            longMethods?: number;
        } | null;
    };
    architectureOverview?: {
        style: string;
        layers: {
            name: string;
            modules: string[];
            fileCount: number;
            role: string;
        }[];
        externalDeps: {
            name: string;
            role: string;
        }[];
        keyInsights: string[];
    } | null;
    technologyStack?: {
        name: string;
        role: string;
        usedBy: string[];
    }[] | null;
    keyAbstractions?: {
        name: string;
        kind: string;
        module: string;
        significance: string;
        detail: string;
    }[] | null;
    codeEntityGraph: {
        totalEntities: number;
        totalEdges: number;
    } | null;
    callGraph: {
        methodEntities: number;
        callEdges: number;
        durationMs: number;
    } | null;
    dependencyGraph: {
        nodes: {
            id: string;
            label: string;
            fileCount?: number;
            dependentCount?: number;
        }[];
        edges: unknown[];
    } | null;
    guardFindings: {
        totalViolations: number;
        errors: number;
        warnings: number;
        topViolations: RuleMapEntry[];
    } | null;
    targets: {
        name: string;
        type: string;
        inferredRole?: string;
        fileCount?: number;
    }[];
    dimensions: DimensionTask[];
    languageExtension: unknown;
    submissionSchema: Record<string, unknown>;
    languageStats: Record<string, number> | null;
    executionPlan: {
        tiers: unknown[];
        totalDimensions: number;
        workflow: string;
    };
    panorama: {
        layers: Array<{
            level: number;
            name: string;
            modules: string[];
        }>;
        couplingHotspots: Array<{
            module: string;
            fanIn: number;
            fanOut: number;
        }>;
        cyclicDependencies: Array<{
            cycle: string[];
            severity: string;
        }>;
        knowledgeGaps: Array<{
            dimension: string;
            dimensionName: string;
            recipeCount: number;
            status: string;
            priority: string;
        }>;
    } | null;
    mustCoverModules: {
        totalLocalPackages: number;
        modules: {
            name: string;
            packageName: string;
            fileCount: number;
            inferredRole?: string;
            keyFiles: string[];
        }[];
        instruction: string;
    } | null;
    session: Record<string, unknown>;
    meta?: {
        responseSizeKB?: number;
        compressionLevel?: string;
        warnings?: string[];
        profile?: BriefingProfile;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
/** buildMissionBriefing 参数 */
interface MissionBriefingParams {
    projectMeta: Record<string, unknown>;
    astData?: AstSummary | null;
    codeEntityResult?: CodeEntityGraphResult | null;
    callGraphResult?: CallGraphResult | null;
    depGraphData?: DependencyGraph | null;
    guardAudit?: GuardAudit | null;
    targets?: (string | TargetInfo)[];
    activeDimensions: DimensionDef[];
    session: {
        toJSON(): Record<string, unknown>;
    };
    languageExtension?: unknown;
    incrementalPlan?: IncrementalPlan | null;
    languageStats?: Record<string, number> | null;
    panoramaResult?: Record<string, unknown> | null;
    localPackageModules?: LocalPackageModule[];
    profile?: BriefingProfile;
    rescan?: RescanBriefingInput;
    responseBudget?: Partial<ResponseBudget>;
}
export { buildEvidenceStarters } from './EvidenceStarterBuilder.js';
/**
 * 构建 Mission Briefing
 *
 * @param opts.projectMeta 项目元数据
 * @param opts.astData analyzeProject() 原始结果
 * @param opts.codeEntityResult CodeEntityGraph.populateFromAst() 结果
 * @param opts.depGraphData discoverer.getDependencyGraph() 结果
 * @param opts.guardAudit GuardCheckEngine.auditFiles() 结果
 * @param opts.targets allTargets 列表
 * @param opts.activeDimensions resolveActiveDimensions() 结果
 * @param opts.skills 已加载的 bootstrap skills
 * @param opts.session BootstrapSession 实例
 * @returns Mission Briefing 响应数据
 */
export declare function buildMissionBriefing({ projectMeta, astData, codeEntityResult, callGraphResult, depGraphData, guardAudit, targets, activeDimensions, session, languageExtension, // §7.1: 语言扩展（反模式、Guard 规则、Agent 注意事项）
incrementalPlan, // §7.3: 增量 Bootstrap 评估结果
languageStats, // §7.4: 完整语言分布统计
panoramaResult, // §M1: Phase 1.8 全景数据
localPackageModules, // 本地子包模块信息
profile, rescan, responseBudget, }: MissionBriefingParams): MissionBriefing;
