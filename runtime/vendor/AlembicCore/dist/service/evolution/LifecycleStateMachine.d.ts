/**
 * LifecycleStateMachine — 唯一生命周期权威
 *
 * 所有 Recipe lifecycle 变更必须且只能通过本类的 transition() 方法执行。
 * 替代旧的 RecipeLifecycleSupervisor（可选增强层 → 必需权威）。
 *
 * 核心职责:
 *   1. Guard 前置检查（合法状态转移验证）
 *   2. Exit Action（离开旧状态的副作用）
 *   3. DB 更新（lifecycle 字段）
 *   4. Entry Action（进入新状态的副作用）
 *   5. 记录 TransitionEvent（不可变审计日志）
 *   6. 发射 lifecycle Signal（集中信号源）
 *
 * 设计原则:
 *   - 所有依赖必需（non-nullable），消除 `?? null` 分支
 *   - Guard 拒绝 = 操作失败，调用者不应 fallback 到 updateLifecycle()
 *   - lifecycle signal 仅从此处发射，服务层不直接操作 SignalBus
 *
 * @module service/evolution/LifecycleStateMachine
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type { LifecycleEventRepository } from '../../repository/evolution/LifecycleEventRepository.js';
import type { ProposalRepository } from '../../repository/evolution/ProposalRepository.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { LifecycleHealthSummary, TimeoutCheckResult, TransitionEvent, TransitionRequest, TransitionResult } from '../../types/evolution.js';
export declare class LifecycleStateMachine {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, eventRepo: LifecycleEventRepository, signalBus: SignalBus, proposalRepo: ProposalRepository);
    /**
     * 执行状态转移 — THE ONLY WAY
     *
     * 流程:
     *   1. 读取当前 lifecycle
     *   2. Guard: isValidTransition(from, to)
     *   3. Exit Action
     *   4. DB 更新
     *   5. Entry Action
     *   6. 记录 TransitionEvent
     *   7. 发射 lifecycle signal
     *
     * Guard 拒绝 → 返回 { success: false }
     * 调用者不应 fallback 到 updateLifecycle()
     */
    transition(request: TransitionRequest): Promise<TransitionResult>;
    checkTimeouts(): Promise<TimeoutCheckResult>;
    getHistory(recipeId: string, limit?: number): TransitionEvent[];
    getHealth(): Promise<LifecycleHealthSummary>;
}
