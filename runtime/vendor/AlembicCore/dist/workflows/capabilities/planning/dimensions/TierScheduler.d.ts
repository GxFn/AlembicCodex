/**
 * TierScheduler — 维度分层并行调度器
 *
 * 内部 Agent 和外部 Agent 共享此调度模型。
 * 按维度间信息依赖关系分 3 层执行:
 * - Tier 1: 基础数据层 (project-profile, 语言条件扫描) — 可并行
 * - Tier 2: 规范+架构+模式 (code-standard, architecture, code-pattern) — 依赖 Tier 1
 * - Tier 3: 流转+实践+总结 (event-and-data-flow, best-practice, agent-guidelines) — 依赖 Tier 2
 *
 * 每层内部可并行 (受 concurrency 限制)，层间串行。
 * 未在任何 Tier 中定义的维度会自动归入 Tier 1（并行执行）。
 *
 * 调用方:
 *   - 内部 Agent dimension execution — 按 Tier 分层调度 AI pipeline
 *   - MissionBriefingBuilder.js (外部 Agent) — executionPlan 中的 Tier 层序展示
 *
 * @module TierScheduler
 */
/** Dimension execution result */
interface DimensionResult {
    error?: string;
    candidateCount?: number;
    [key: string]: unknown;
}
/** Options for TierScheduler.execute() */
interface TierExecuteOptions {
    concurrency?: number;
    onTierComplete?: (tierIndex: number, tierResults: Map<string, DimensionResult>) => void;
    shouldAbort?: () => boolean;
    activeDimIds?: string[];
    tierHints?: Record<string, number>;
}
export declare class TierScheduler {
    #private;
    /** @param [tiers] 自定义分层 (默认使用 DEFAULT_TIERS) */
    constructor(tiers?: string[][]);
    /**
     * 分层执行维度
     *
     * @param executeDimension async (dimId) => DimensionResult
     * @param [options.concurrency=3] Tier 内最大并行数
     * @param [options.onTierComplete] (tierIndex, tierResults) => void
     * @param [options.shouldAbort] () => boolean 外部中止信号
     * @param [options.activeDimIds] 实际要执行的维度 ID 列表（过滤不在列表中的维度）
     * @param [options.tierHints] dimId → 1-based tier index（Enhancement Pack 维度声明的首选 Tier）
     * @returns dimId → result
     */
    execute(executeDimension: (dimId: string) => Promise<DimensionResult>, options?: TierExecuteOptions): Promise<Map<any, any>>;
    /**
     * 获取维度所在的 Tier 索引
     * @returns 0-based tier index, -1 if not found
     */
    getTierIndex(dimId: string): number;
    /** 获取分层定义 */
    getTiers(): string[][];
}
export default TierScheduler;
