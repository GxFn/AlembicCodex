/**
 * RuleLearner — Guard 规则学习系统
 * 追踪规则触发与用户反馈，计算 P/R/F1，识别高误报规则并给出优化建议
 * 持久化到 Alembic/guard-learner.json（Git 友好）
 */
import type { WriteZone } from '../../infrastructure/io/index.js';
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
interface RuleStat {
    triggers: number;
    correct: number;
    falsePositive: number;
    falseNegative: number;
    firstTriggered: string | null;
    lastTriggered: string | null;
    lastFeedback: string | null;
}
export declare class RuleLearner {
    #private;
    constructor(projectRoot: string, options?: {
        knowledgeBaseDir?: string;
        internalDir?: string;
        signalBus?: SignalBus;
        wz?: WriteZone;
    });
    /**
     * 记录规则触发
     * @param context
     */
    recordTrigger(ruleId: string, _context?: Record<string, unknown>): void;
    /** 记录用户反馈 */
    recordFeedback(ruleId: string, feedbackType: 'correct' | 'falsePositive' | 'falseNegative'): void;
    /**
     * 获取规则精准度指标
     * @returns }
     */
    getMetrics(ruleId: string): {
        precision: number;
        recall: number;
        f1: number;
        triggers: number;
        falsePositiveRate: number;
    };
    /**
     * 识别问题规则（高误报）
     * @returns >}
     */
    getProblematicRules(): {
        ruleId: string;
        metrics: ReturnType<RuleLearner["getMetrics"]>;
        recommendation: string;
    }[];
    /** 获取所有规则统计 */
    getAllStats(): Record<string, RuleStat & {
        metrics: ReturnType<RuleLearner["getMetrics"]>;
    }>;
    /** 重置指定规则或全部统计 */
    resetStats(ruleId?: string | null): void;
    /**
     * 基于历史数据提出规则优化建议
     * 策略 1: 高误报规则 → 建议调整
     * 策略 2: 高触发且高精度 → 建议创建项目特化版本
     * @returns >}
     */
    suggestRules(): {
        type: string;
        ruleId: string;
        message: string;
        confidence: number;
        evidence: Record<string, unknown>;
    }[];
    /**
     * 追踪规则创建后的效果
     * 对比首次触发后的表现，判断规则是否有效
     * @returns }
     */
    trackRuleEffectiveness(ruleId: string): {
        status: string;
        triggers: number;
        precision: number;
        recommendation: string;
        daysSinceFirstTrigger?: undefined;
    } | {
        status: string;
        triggers: number;
        precision: number;
        recommendation: string;
        daysSinceFirstTrigger: number;
    };
    /**
     * RuleLearner→Recipe 桥接: 检查是否有高误报规则需要触发衰退
     * 当 FP > 40% && triggers >= minTriggers 时，发射衰退信号到 SignalBus
     * @returns 需要衰退检查的规则列表
     */
    checkPrecisionDrop(): {
        ruleId: string;
        falsePositiveRate: number;
        recommendation: string;
    }[];
}
export {};
