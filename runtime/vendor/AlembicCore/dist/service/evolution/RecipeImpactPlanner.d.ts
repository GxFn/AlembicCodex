/**
 * RecipeImpactPlanner — 批量进化候选生成器
 *
 * 基于 FileDiffSnapshotStore.computeDiff 的 hash diff 结果（非 git diff），
 * 批量分析所有变更文件对 Recipe 的影响，生成 EvolutionCandidatePlan。
 *
 * 与 FileChangeHandler 的区别:
 *   - FileChangeHandler 处理实时 IDE 事件，使用 git diff HEAD，逐个文件分析
 *   - RecipeImpactPlanner 处理 rescan 批量 diff，消费 runAllPhases 的 incrementalPlan 产出
 *
 * @module service/evolution/RecipeImpactPlanner
 */
import type { ProposalSource } from '../../repository/evolution/ProposalRepository.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { RecipeSourceRefRepositoryImpl } from '../../repository/sourceref/RecipeSourceRefRepository.js';
import type { EvolutionDecision, EvolutionResult } from './EvolutionGateway.js';
export type EvolutionCandidateReason = 'source-deleted' | 'source-deleted-partial' | 'source-modified-pattern' | 'source-missing';
export interface EvolutionCandidate {
    recipeId: string;
    recipeTitle: string;
    reason: EvolutionCandidateReason;
    affectedFiles: string[];
    impactScore: number;
    matchedTokens: string[];
    sourceRefs: string[];
    activeRefCount: number;
}
export interface IgnoredChange {
    filePath: string;
    reason: 'no-recipe-reference' | 'impact-below-threshold' | 'recipe-not-active';
}
export interface EvolutionCandidatePlan {
    candidates: EvolutionCandidate[];
    ignored: IgnoredChange[];
    summary: {
        totalChangedFiles: number;
        filesWithRecipeRef: number;
        candidateCount: number;
        ignoredCount: number;
        byReason: Record<string, number>;
    };
}
export interface DiffInput {
    added: string[];
    modified: string[];
    deleted: string[];
}
export interface RescanImpactSubmissionResult {
    submitted: number;
    skipped: number;
    errors: Array<{
        recipeId: string;
        error: string;
    }>;
    processedRecipeIds: string[];
    results: EvolutionResult[];
}
/** Core 只保留审计输入契约，不依赖外层 Evolution Agent runtime。 */
export interface EvolutionAuditRecipe {
    id: string;
    title: string;
    trigger: string;
    content?: unknown;
    sourceRefs: string[];
    impactEvidence: {
        reason: EvolutionCandidateReason;
        affectedFiles: string[];
        impactScore: number;
        matchedTokens: string[];
    };
    auditHint: string | null;
}
interface EvolutionGatewayLike {
    submit(decision: EvolutionDecision): Promise<EvolutionResult>;
}
export declare class RecipeImpactPlanner {
    #private;
    constructor(projectRoot: string, sourceRefRepo: RecipeSourceRefRepositoryImpl, knowledgeRepo: KnowledgeRepositoryImpl);
    plan(diff: DiffInput | null): Promise<EvolutionCandidatePlan>;
}
/**
 * 将 EvolutionCandidate 转换为 EvolutionAuditRecipe（供 runEvolutionAudit 消费）。
 *
 * @param candidate RecipeImpactPlanner.plan() 产出的候选
 * @param knowledgeRepo 用于获取 Recipe 完整内容
 */
export declare function toEvolutionAuditRecipe(candidate: EvolutionCandidate, knowledgeRepo: KnowledgeRepositoryImpl): Promise<EvolutionAuditRecipe>;
/**
 * 将高置信 diff 候选转换为确定性 Gateway 决策。
 *
 * 只处理无需 LLM 判断的直接信号：
 * - source-modified-pattern: 代码触碰了 Recipe 关键 token，先创建 update proposal
 * - source-deleted: 所有来源丢失，按 FileChangeHandler 同语义提交 deprecate
 *
 * source-deleted-partial/source-missing 仍交给 Evolution Agent 判断迁移、替代或有效性。
 */
export declare function toRescanImpactDecision(candidate: EvolutionCandidate, opts?: {
    source?: ProposalSource;
    now?: number;
}): EvolutionDecision | null;
export declare function submitRescanImpactDecisions(candidatePlan: EvolutionCandidatePlan, gateway: EvolutionGatewayLike, opts?: {
    source?: ProposalSource;
    now?: number;
}): Promise<RescanImpactSubmissionResult>;
export {};
