import type { EvolutionCandidatePlan } from '../../../../service/evolution/RecipeImpactPlanner.js';
import type { DimensionDef } from '../../../../types/project-snapshot.js';
import type { RecipeSnapshotEntry } from '../../RecipeSnapshotTypes.js';
import { type EvolutionPrescreen } from './EvolutionPrescreen.js';
import { type AuditVerdict, type BuildKnowledgeRescanPlanOptions, buildKnowledgeRescanPlan, type KnowledgeRescanDimensionPlan, type KnowledgeRescanExecutionDecision, type KnowledgeRescanPlan, type RescanExecutionMode, type RescanExecutionReason, type RescanExecutionReasonKind, TARGET_RECIPES_PER_DIMENSION } from './KnowledgeRescanPlanBuilder.js';
import { type ExternalDimensionGap, type ExternalRescanEvidencePlan, type InternalRescanGapPlan, projectExternalRescanEvidencePlan, projectInternalRescanGapPlan, projectInternalRescanPromptRecipes } from './RescanEvidenceProjectors.js';
/** 单个 Recipe 的审计结果 */
export interface RelevanceAuditResult {
    recipeId: string;
    title: string;
    relevanceScore: number;
    verdict: 'healthy' | 'watch' | 'decay' | 'severe' | 'dead';
    evidence: {
        triggerStillMatches: boolean;
        symbolsAlive: number;
        depsIntact: boolean;
        codeFilesExist: number;
    };
    decayReasons: string[];
}
/** 审计汇总 */
export interface RelevanceAuditSummary {
    totalAudited: number;
    healthy: number;
    watch: number;
    decay: number;
    severe: number;
    dead: number;
    results: RelevanceAuditResult[];
    proposalsCreated: number;
    immediateDeprecated: number;
}
export { buildKnowledgeRescanPlan, projectExternalRescanEvidencePlan, projectInternalRescanGapPlan, projectInternalRescanPromptRecipes, TARGET_RECIPES_PER_DIMENSION, };
export type { AuditVerdict, ExternalDimensionGap, ExternalRescanEvidencePlan, InternalRescanGapPlan, KnowledgeRescanDimensionPlan, KnowledgeRescanExecutionDecision, KnowledgeRescanPlan, RescanExecutionMode, RescanExecutionReason, RescanExecutionReasonKind, };
interface RescanLogger {
    info(msg: string, meta?: Record<string, unknown>): void;
    warn(msg: string, meta?: Record<string, unknown>): void;
}
interface RescanServiceContainer {
    get(name: string): unknown;
    services?: Record<string, unknown>;
}
export interface KnowledgeSyncOptions {
    container: RescanServiceContainer;
    db: unknown;
    logger: RescanLogger;
    logPrefix: string;
}
export interface RecipeAuditOptions {
    container: RescanServiceContainer;
    logger: RescanLogger;
    recipeEntries: RecipeSnapshotEntry[];
    allFiles: Array<{
        path?: string;
        relativePath?: string;
        name: string;
    }>;
    projectRoot?: string;
    /** RecipeImpactPlanner 产出的增量候选（可选，有则增强 verdict 精度） */
    candidatePlan?: EvolutionCandidatePlan | null;
}
export declare function syncKnowledgeStoreForRescan(opts: KnowledgeSyncOptions): void;
/**
 * 对保留的 Recipe 进行覆盖分类，为 gap analysis 和 EvolutionPrescreen 提供数据。
 *
 * 进化触发由 RecipeImpactPlanner + EvolutionAgent 管线负责，
 * 本函数仅负责 coverage classification（全量 recipe → verdict）。
 *
 * 数据来源优先级：
 *   1. RecipeImpactPlanner 候选（candidatePlan）— 精确的 diff-based 影响评估
 *   2. SourceRef 桥接表（recipeSourceRefRepository）— active/stale 文件映射
 *   3. Recipe 生命周期（lifecycle）— 兜底分类
 *
 * 评分由 EvolutionPolicy.classifyRelevance() 统一分级（阈值: 80/60/40/20）。
 */
export declare function auditRecipesForRescan(opts: RecipeAuditOptions): Promise<RelevanceAuditSummary>;
export declare function buildRescanPrescreen(auditSummary: RelevanceAuditSummary, recipeEntries: RecipeSnapshotEntry[], dimensions: Array<{
    id: string;
}>): EvolutionPrescreen;
export declare function planInternalRescanGaps(opts: BuildKnowledgeRescanPlanOptions): InternalRescanGapPlan;
export declare function buildExistingRecipesForInternalFill(opts: {
    recipeEntries: RecipeSnapshotEntry[];
    auditSummary: RelevanceAuditSummary;
    auditVerdictMap: Map<string, AuditVerdict>;
}): Array<{
    id: string;
    title: string;
    trigger: string;
    knowledgeType: string;
    status: 'decaying' | 'healthy';
    decayReason?: string;
    auditScore?: number;
    content?: {
        markdown?: string;
        rationale?: string;
        coreCode?: string;
    };
    sourceRefs?: string[];
    auditEvidence?: Record<string, unknown>;
}>;
export declare function buildExternalRescanEvidencePlan(opts: {
    recipeEntries: RecipeSnapshotEntry[];
    auditSummary: RelevanceAuditSummary;
    dimensions: DimensionDef[];
    targetPerDimension?: number;
}): ExternalRescanEvidencePlan;
