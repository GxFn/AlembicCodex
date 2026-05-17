/**
 * UnifiedValidator.js — 统一验证链
 *
 * 替代 CandidateGuardrail + RecipeReadinessChecker 的分裂验证，
 * 提供单一入口的三层验证 (字段完整性 + 内容质量 + 去重)。
 *
 * 统一严格模式：完整 REQUIRED 字段检查，无宽松降级。
 *
 * @module shared/UnifiedValidator
 */
export declare class UnifiedValidator {
    #private;
    /**
     * @param [options.existingTitles] 预填充已有标题
     * @param [options.existingFingerprints] 预填充已有代码指纹
     * @param [options.existingTriggers] 预填充已有 trigger
     */
    constructor(options?: {
        existingTitles?: Set<string>;
        existingFingerprints?: Set<string>;
        existingTriggers?: Set<string>;
    });
    /**
     * 完整验证链 (3 层)
     *
     * @param candidate 候选数据（扁平字段）
     * @param [options.mode] 验证模式（自动检测或手动指定）
     * @param [options.systemInjectedFields] 系统注入的字段（跳过 REQUIRED 检查）
     * @param [options.skipUniqueness=false] 跳过去重检查
     * @returns }
     */
    validate(candidate: Record<string, unknown>, options?: {
        systemInjectedFields?: string[];
        skipUniqueness?: boolean;
    }): {
        pass: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * 记录已提交的标题和代码指纹（提交成功后调用）
     * @param [pattern] 代码模式
     */
    recordSubmission(title: string | null | undefined, pattern: string | null | undefined, trigger?: string | null): void;
}
/** 创建一个无状态验证器实例（不含去重缓存），适用于一次性校验 */
export declare function createStatelessValidator(): UnifiedValidator;
export default UnifiedValidator;
