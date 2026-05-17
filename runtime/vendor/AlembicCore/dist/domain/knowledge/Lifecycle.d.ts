/**
 * Lifecycle — 知识实体生命周期状态机（六态版）
 *
 * pending    — 待审核（所有新条目初始状态）
 * staging    — 暂存期（高置信度，Grace Period 后自动 active）
 * active     — 已发布（可被搜索/Guard/Export 消费）
 * evolving   — 进化中（有 EvolutionProposal 附着，内容待更新）
 * decaying   — 衰退观察（30d Grace + 3x 确认后 deprecated）
 * deprecated — 已废弃
 */
export declare const Lifecycle: {
    /** 待审核 */
    PENDING: string;
    /** 暂存期（高置信度，Grace Period 后自动 active） */
    STAGING: string;
    /** 已发布（可被搜索/Guard/Export 消费） */
    ACTIVE: string;
    /** 进化中（有 EvolutionProposal 附着） */
    EVOLVING: string;
    /** 衰退观察期 */
    DECAYING: string;
    /** 已弃用 */
    DEPRECATED: string;
};
/** 候选阶段的所有状态 */
export declare const CANDIDATE_STATES: string[];
/** 可消费状态（Guard/Search/插件适配可使用的状态） */
export declare const CONSUMABLE_STATES: string[];
/** 降级消费状态（Guard violation 降为 warning，Search 降权） */
export declare const DEGRADED_STATES: string[];
/** 可消费状态（别名，与 CONSUMABLE_STATES 相同） */
export declare const CONSUMABLE_LIFECYCLES: string[];
/** 可计数状态: 全景/统计看板应纳入的 Recipe（含 PENDING） */
export declare const COUNTABLE_LIFECYCLES: readonly [string, string, string, string];
/** 候选状态（别名，与 CANDIDATE_STATES 相同） */
export declare const CANDIDATE_LIFECYCLES: string[];
/** Guard 可消费状态（含降级 decaying）: Guard/Search 可匹配的全范围 */
export declare const GUARD_LIFECYCLES: readonly [string, string, string, string];
/** 已发布状态: 通过置信度路由已确认的 Recipe */
export declare const PUBLISHED_LIFECYCLES: readonly [string, string];
/** 非弃用状态: 除 deprecated 外所有 */
export declare const NON_DEPRECATED_LIFECYCLES: readonly [string, string, string, string, string];
/** 类型导出 */
export type LifecycleFilter = (typeof Lifecycle)[keyof typeof Lifecycle];
/** 规范化生命周期值 */
export declare function normalizeLifecycle(lifecycle: string): string;
/** 检查状态转移是否合法 */
export declare function isValidTransition(from: string, to: string): boolean;
/** 是否为合法的生命周期值 */
export declare function isValidLifecycle(lifecycle: string): boolean;
/** 是否处于候选阶段（待审核或暂存） */
export declare function isCandidate(lifecycle: string): boolean;
/** 是否为可消费状态（Guard/Search/插件适配可使用） */
export declare function isConsumable(lifecycle: string): boolean;
/** 是否为降级消费状态 */
export declare function isDegraded(lifecycle: string): boolean;
/**
 * 生成 `column IN (?, ?, ...)` SQL 片段和对应的参数数组。
 * 用于在 raw SQL 中安全引用 lifecycle 常量数组。
 *
 * @example
 * const { sql, params } = lifecycleInSql(COUNTABLE_LIFECYCLES);
 * db.prepare(`SELECT * FROM knowledge_entries WHERE ${sql}`).all(...params);
 */
export declare function lifecycleInSql(lifecycles: readonly string[], column?: string): {
    sql: string;
    params: string[];
};
/** 从 knowledgeType 推导 kind */
export declare function inferKind(knowledgeType: string): 'rule' | 'pattern' | 'fact';
export default Lifecycle;
