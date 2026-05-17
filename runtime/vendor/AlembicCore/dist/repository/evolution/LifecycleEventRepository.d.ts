/**
 * LifecycleEventRepository — lifecycle_transition_events 表 CRUD (Drizzle ORM)
 *
 * 操作 lifecycle_transition_events 表，存储 Recipe 生命周期状态转移事件。
 *
 * Drizzle 迁移策略：
 *   - 替代 RecipeLifecycleSupervisor 中的所有 rawDb.prepare() 调用
 *   - 消除 12 个 escape-hatch 注解
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
import type { TransitionEvent, TransitionEvidence } from '../../types/evolution.js';
export interface RecordEventInput {
    id: string;
    recipeId: string;
    fromState: string;
    toState: string;
    trigger: string;
    operatorId: string;
    evidence: TransitionEvidence | null;
    proposalId: string | null;
    createdAt: number;
}
export interface TransitionEventRow {
    id: string;
    recipeId: string;
    fromState: string;
    toState: string;
    trigger: TransitionEvent['trigger'];
    operatorId: string;
    evidence: TransitionEvidence | null;
    proposalId: string | null;
    createdAt: number;
}
export declare class LifecycleEventRepository {
    #private;
    constructor(drizzle: DrizzleDB);
    record(input: RecordEventInput): void;
    /** 获取指定 Recipe 的转移历史（按时间倒序） */
    getHistory(recipeId: string, limit?: number): TransitionEvent[];
    /** 统计指定时间之后的事件数量 */
    countSince(since: number): number;
    /** 按 trigger 分组统计（限定时间窗口，按数量倒序前 N） */
    topTriggersSince(since: number, limit?: number): {
        trigger: string;
        count: number;
    }[];
    /** 按 trigger 值统计数量 */
    countByTrigger(trigger: string): number;
    /** 按多个 trigger 值统计数量 */
    countByTriggers(triggers: string[]): number;
}
