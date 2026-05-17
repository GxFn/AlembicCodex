/**
 * StagingManager — staging Grace Period 管理 + 自动发布
 *
 * 核心职责：
 *   1. 条目进入 staging 后记录 deadline
 *   2. 定时检查：deadline 到期 + 无异议 → 自动转 active
 *   3. 异常回滚：Guard 检测到冲突 → 回滚到 pending
 *   4. 发射信号通知 Dashboard
 *
 * 分级 Grace Period（由 ConfidenceRouter 决定）：
 *   ≥ 0.90 → 24h
 *   0.85-0.89 → 72h
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
export interface StagingEntry {
    id: string;
    title: string;
    stagingDeadline: number;
    confidence: number;
}
export interface StagingCheckResult {
    promoted: StagingEntry[];
    rolledBack: StagingEntry[];
    waiting: StagingEntry[];
}
export declare class StagingManager {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, options?: {
        signalBus?: SignalBus;
    });
    /**
     * 将条目推入 staging 状态并记录 deadline
     */
    enterStaging(entryId: string, gracePeriodMs: number, confidence: number): Promise<boolean>;
    /**
     * 检查所有 staging 条目，执行自动发布或回滚
     */
    checkAndPromote(): Promise<StagingCheckResult>;
    /**
     * 回滚 staging 条目到 pending（Guard 检测到冲突时调用）
     */
    rollback(entryId: string, reason: string): Promise<boolean>;
    /**
     * 获取所有 staging 条目及其状态
     */
    listStaging(): Promise<StagingEntry[]>;
}
