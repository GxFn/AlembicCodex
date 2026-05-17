/**
 * RecipeReadinessChecker — 共享 Recipe-Ready 字段完整性检查
 *
 * ⚠️ 已重构为 UnifiedValidator 的薄封装。
 * 保留此模块以兼容旧调用方签名，新代码请直接使用 UnifiedValidator。
 *
 * @param item 候选数据（扁平字段或含 metadata 的对象）
 * @returns }
 */
declare const STANDARD_CATEGORIES: string[];
/** Bootstrap 等特殊来源使用的 category 白名单 */
declare const WHITELISTED_CATEGORIES: string[];
/**
 * 检查候选是否具备直接提升为 Recipe 的所有必要字段。
 *
 * 薄封装: 内部调用 UnifiedValidator，将结果转换为旧格式 { ready, missing, suggestions }。
 *
 * @param item 扁平字段对象（title, trigger, description …）
 * @returns }
 */
export declare function checkRecipeReadiness(item: Record<string, unknown>): {
    ready: boolean;
    missing: string[];
    suggestions: string[];
};
/** 从 Candidate 的 metadata 对象展开为扁平字段后检查 readiness。 */
export declare function checkReadinessFromCandidate(candidate: Record<string, unknown>): {
    ready: boolean;
    missing: string[];
    suggestions: string[];
};
export { STANDARD_CATEGORIES, WHITELISTED_CATEGORIES };
