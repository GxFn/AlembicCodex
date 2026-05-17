/**
 * ProposalExecutor — 信号驱动的提案执行引擎
 *
 * 核心职责：
 *   1. 订阅 SignalBus（guard / search / decay / quality），当关联 Recipe 有活跃 Proposal 时触发评估
 *   2. 评估 → 通过 EvolutionPolicy 判定（纯函数）
 *   3. 通过 → 编排执行（update → ContentPatcher / deprecate → LifecycleStateMachine）
 *   4. 不通过 → 继续等待下一个信号
 *
 * 设计原则：
 *   - 从时间驱动转为信号驱动：不再依赖 expiresAt + 定时轮询，而是每个相关信号到达即评估
 *   - 决策逻辑全部委托给 EvolutionPolicy（纯函数）
 *   - 状态转移全部通过 LifecycleStateMachine（唯一权威）
 *   - lifecycle signal 由 StateMachine 内部自动发射
 *   - 所有依赖必需（non-nullable），消除降级路径
 *
 * @module service/evolution/ProposalExecutor
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type { ProposalRepository, ProposalType } from '../../repository/evolution/ProposalRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { ContentPatcher } from './ContentPatcher.js';
import type { LifecycleStateMachine } from './LifecycleStateMachine.js';
export interface ProposalExecutionResult {
    executed: {
        id: string;
        type: ProposalType;
        targetRecipeId: string;
    }[];
    rejected: {
        id: string;
        type: ProposalType;
        reason: string;
    }[];
    expired: {
        id: string;
        type: ProposalType;
    }[];
    skipped: {
        id: string;
        type: ProposalType;
        reason: string;
    }[];
}
export declare class ProposalExecutor {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, repo: ProposalRepository, lifecycle: LifecycleStateMachine, contentPatcher: ContentPatcher, edgeRepo: KnowledgeEdgeRepositoryImpl);
    /**
     * 订阅 SignalBus，当信号到达时自动评估关联 Proposal。
     * 调用方负责在关闭时调用 unsubscribe()。
     */
    subscribeToSignals(signalBus: SignalBus): void;
    /**
     * 取消信号订阅
     */
    unsubscribe(): void;
    /**
     * 手动执行单个 Proposal（Dashboard 按钮触发）
     */
    executeOne(id: string): Promise<ProposalExecutionResult>;
    /**
     * 启动时一次性清理 — 清理过期 Pending、对长期 Observing 做兜底评估
     *
     * 不再被定时调用，仅在 Dashboard 启动时 / CLI evolve-check 时调用。
     * 主要流程已由 subscribeToSignals() 接管。
     */
    checkAndExecute(): Promise<ProposalExecutionResult>;
}
