/**
 * EvolutionGateway — 统一进化决策入口
 *
 * 所有进化决策（Agent 工具、MCP handler、Evolution Agent）最终都汇聚到这里。
 * 三种进化方向：update | deprecate | valid
 *
 * 设计意图：
 *   - 消除 Agent tools / MCP handler / Metabolism 各自独立的 Proposal 创建逻辑
 *   - 统一 observation window 策略（按风险等级，由 EvolutionPolicy 集中管理）
 *   - deprecate 路径按来源区分：Agent 高置信 → 立即执行；规则引擎 → 观察窗口
 *   - lifecycle 变更通过 LifecycleStateMachine 唯一路径，Guard 拒绝 → 降级为 Proposal
 *
 * @module service/evolution/EvolutionGateway
 */
import type { ProposalRepository, ProposalSource } from '../../repository/evolution/ProposalRepository.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { LifecycleStateMachine } from './LifecycleStateMachine.js';
/** Recipe 进化的三种且仅有三种方向 */
export type EvolutionAction = 'update' | 'deprecate' | 'valid';
/** 风险等级，决定观察窗口时长 */
export type RiskTier = 'low' | 'medium' | 'high';
/** 提交给 Gateway 的进化决策 */
export interface EvolutionDecision {
    recipeId: string;
    action: EvolutionAction;
    source: ProposalSource;
    confidence: number;
    description?: string;
    evidence?: Record<string, unknown>[];
    reason?: string;
    /** supersede 场景：被替代 Recipe 的 ID */
    replacedByRecipeId?: string;
}
/** Gateway 处理结果 */
export interface EvolutionResult {
    recipeId: string;
    action: EvolutionAction;
    outcome: 'proposal-created' | 'proposal-upgraded' | 'immediately-executed' | 'verified' | 'skipped' | 'error';
    proposalId?: string;
    error?: string;
}
export declare class EvolutionGateway {
    #private;
    constructor(proposalRepo: ProposalRepository, lifecycle: LifecycleStateMachine, knowledgeRepo: KnowledgeRepositoryImpl);
    /**
     * 统一提交进化决策
     */
    submit(decision: EvolutionDecision): Promise<EvolutionResult>;
    /**
     * 批量提交进化决策
     */
    submitBatch(decisions: EvolutionDecision[]): Promise<EvolutionResult[]>;
}
