import type { KnowledgeEntry } from '../../domain/knowledge/KnowledgeEntry.js';
import Logger from '../../infrastructure/logging/Logger.js';
import type { QualityScorer } from '../quality/QualityScorer.js';
interface ConfidenceRouterConfig {
    autoApproveThreshold?: number;
    rejectThreshold?: number;
    minContentLength?: number;
    requireReasoning?: boolean;
    trustedSources?: string[];
    trustedAutoApproveThreshold?: number;
    highConfidenceThreshold?: number;
    standardGracePeriod?: number;
    highConfidenceGracePeriod?: number;
}
interface RouteResult {
    action: 'auto_approve' | 'pending' | 'reject';
    reason: string;
    confidence?: number;
    /** 目标生命周期状态（六态状态机） */
    targetState?: 'staging' | 'pending' | 'deprecated';
    /** Grace Period（毫秒）— staging → active 自动转换等待时间 */
    gracePeriod?: number;
}
/**
 * ConfidenceRouter — 知识条目自动审核路由器
 *
 * 根据 KnowledgeEntry 的 reasoning.confidence、质量评分、
 * 内容完整性等信号判断是否可自动审核通过。
 *
 * 路由结果:
 *   auto_approve — 置信度高、内容完整，自动通过 + fastTrack
 *   pending      — 需要人工审核
 *   reject       — 置信度过低或不满足基本要求
 */
declare const DEFAULT_CONFIG: {
    /** 自动通过的最低 confidence 阈值 */
    autoApproveThreshold: number;
    /** 自动驳回的 confidence 阈值 */
    rejectThreshold: number;
    /** 需要的最少内容字符数 */
    minContentLength: number;
    /** 自动通过要求 reasoning.isValid() */
    requireReasoning: boolean;
    /** 来源白名单（这些来源可以适用更宽松的阈值） */
    trustedSources: string[];
    /** 可信来源的自动通过阈值 */
    trustedAutoApproveThreshold: number;
    /** 极高置信度阈值 (≥0.90 → 24h Grace) */
    highConfidenceThreshold: number;
    /** 标准 Grace Period（72h）— staging → active */
    standardGracePeriod: number;
    /** 高置信度 Grace Period（24h） */
    highConfidenceGracePeriod: number;
};
export declare class ConfidenceRouter {
    _config: Required<typeof DEFAULT_CONFIG>;
    _qualityScorer: QualityScorer | null;
    logger: ReturnType<typeof Logger.getInstance>;
    /** @param [config] 路由配置 */
    constructor(config?: ConfidenceRouterConfig, qualityScorer?: QualityScorer | null);
    /**
     * 路由决策
     * @returns >}
     */
    route(entry: KnowledgeEntry): Promise<RouteResult>;
    /** 估算内容长度 */
    _estimateContentLength(entry: KnowledgeEntry): number;
}
export default ConfidenceRouter;
