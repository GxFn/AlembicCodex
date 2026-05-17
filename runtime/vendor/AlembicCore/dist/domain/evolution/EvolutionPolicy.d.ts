/**
 * EvolutionPolicy — 进化决策规则集
 *
 * 纯函数，无 I/O，无副作用。
 * 所有阈值和分级逻辑集中在此，服务层只做编排。
 *
 * @module domain/evolution/EvolutionPolicy
 */
export type RiskTier = 'low' | 'medium' | 'high';
export type RelevanceVerdict = 'healthy' | 'watch' | 'decay' | 'severe' | 'dead';
export interface UpdateVerdict {
    pass: boolean;
    reason: string;
}
export interface DeprecateVerdict {
    action: 'deprecated' | 'decaying' | 'reject';
    reason: string;
}
export declare class EvolutionPolicy {
    /** 风险分级 */
    static assessRisk(action: 'update' | 'deprecate', confidence: number, _source?: string): RiskTier;
    /** 观察窗口时长（毫秒） */
    static observationWindow(risk: RiskTier): number;
    /** 是否应立即执行（跳过 Proposal 观察） */
    static shouldImmediateExecute(action: string, confidence: number, source: string): boolean;
    /** Proposal 创建时的初始状态 */
    static resolveInitialStatus(type: 'update' | 'deprecate', confidence: number): 'pending' | 'observing';
    /** Update Proposal 到期评估 */
    static evaluateUpdate(metrics: {
        ruleFalsePositiveRate: number;
        guardHits: number;
        searchHits: number;
    }): UpdateVerdict;
    /** Deprecate Proposal 到期评估 */
    static evaluateDeprecate(currentDecay: number, snapshotDecay: number): DeprecateVerdict;
    /** 相关性评分 → Verdict + 置信度 */
    static classifyRelevance(score: number): {
        verdict: RelevanceVerdict;
        confidence: number;
    };
    /** Pending Proposal 是否应过期 */
    static shouldExpirePending(proposedAt: number, now: number): boolean;
}
