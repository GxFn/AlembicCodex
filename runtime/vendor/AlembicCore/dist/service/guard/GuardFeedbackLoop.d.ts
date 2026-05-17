/**
 * GuardFeedbackLoop — Guard ↔ Recipe 闭环联动
 *
 * 功能:
 *   1. 对比当前和历史 violations，检测已修复的违规
 *   2. 已修复违规如有 fixSuggestion → 自动 confirmUsage（记录 Recipe 使用）
 *   3. 集成到 guardAuditFiles MCP handler 和 GuardHandler (FileWatcher)
 */
import Logger from '../../infrastructure/logging/Logger.js';
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
interface ViolationsStoreLike {
    getRunsByFile(filePath: string): {
        violations: {
            ruleId: string;
            fixSuggestion?: string;
        }[];
    }[];
}
interface FeedbackCollectorLike {
    record(action: string, recipeId: string, meta: Record<string, unknown>): void;
}
interface GuardCheckEngineLike {
    getRules(): {
        id: string;
        fixSuggestion?: string;
    }[];
}
interface CheckResult {
    violations: {
        ruleId: string;
        fixSuggestion?: string;
    }[];
}
interface FixedViolation {
    ruleId: unknown;
    filePath: string;
    fixRecipeId: string;
}
export declare class GuardFeedbackLoop {
    feedbackCollector: FeedbackCollectorLike | null;
    guardCheckEngine: GuardCheckEngineLike | null;
    logger: ReturnType<typeof Logger.getInstance>;
    violationsStore: ViolationsStoreLike | null;
    _signalBus: SignalBus | null;
    /** @param [options.guardCheckEngine] 用于查找规则 */
    constructor(violationsStore: ViolationsStoreLike | null, feedbackCollector: FeedbackCollectorLike | null, options?: {
        guardCheckEngine?: GuardCheckEngineLike;
        signalBus?: SignalBus;
    });
    /**
     * 对比当前和历史 violations，检测已修复的违规
     * @param currentResult 本次检查结果
     * @param filePath 文件路径
     * @returns >} 已修复且有 Recipe 关联的列表
     */
    detectFixedViolations(currentResult: CheckResult, filePath: string): FixedViolation[];
    /**
     * 对已修复的违规自动确认使用
     * @param fixedList
     */
    autoConfirmUsage(fixedList: FixedViolation[]): void;
    /**
     * 一站式处理：检测修复 + 自动确认
     * 供 MCP handler、GuardHandler、HTTP guard/file 端点集成调用
     * @param currentResult
     */
    processFixDetection(currentResult: CheckResult, filePath: string): FixedViolation[];
    /**
     * 获取闭环统计数据
     * @returns }
     */
    getStats(): {
        hasViolationsStore: boolean;
        hasFeedbackCollector: boolean;
        hasGuardCheckEngine: boolean;
    };
    /**
     * 从 violation 或 GuardCheckEngine 查找 fixRecipeId
     * 增强：当无显式 fixSuggestion 时，以 ruleId 本身作为 fallback recipeId
     * 这允许 Knowledge Base 中以 ruleId 命名的条目自动关联
     */
    _findFixRecipe(ruleId: string, violations: {
        ruleId: string;
        fixSuggestion?: string;
    }[]): string | null;
}
export default GuardFeedbackLoop;
