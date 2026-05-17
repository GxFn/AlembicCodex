/**
 * ContentImpactAnalyzer — Diff-Based Recipe 影响评估 (v3)
 *
 * 核心思想：影响评估分析「这次改了什么」（diff），而非「文件整体和 Recipe 有多像」。
 *
 * 流程：
 *   1. git diff -U0 获取文件行级变更
 *   2. 从变更行提取代码标识符（diff tokens）
 *   3. 从 Recipe 全字段提取特征标识符（recipe tokens）
 *   4. 计算加权交集：impact = |T_R ∩ T_Δ| / |T_R|
 *
 * 不支持 git 的场景直接跳过，不做降级。
 *
 * Token 提取基础设施已移至 shared/recipe-tokens.ts，本模块聚焦 diff 影响评估。
 *
 * @module service/evolution/ContentImpactAnalyzer
 */
import type { ImpactLevel } from '../../types/reactive-evolution.js';
export { extractApiTokens, extractRecipeTokens, type RecipeTokens, tokenizeIdentifiers, } from '../../shared/recipe-tokens.js';
import type { RecipeTokens } from '../../shared/recipe-tokens.js';
/** Diff 影响评估结果 */
export interface DiffImpactResult {
    level: ImpactLevel;
    score: number;
    matchedTokens: string[];
}
/**
 * 评估文件 diff 对 Recipe 的影响级别。
 *
 * 完整流程入口：获取 diff → 解析 → 提取 token → 与 Recipe token 交集计算。
 *
 * @param projectRoot 项目根目录绝对路径
 * @param relativePath 相对于项目根的文件路径
 * @param recipeTokens 预提取的 Recipe 特征标识符
 * @returns 影响评估结果，或 null（无法获取 diff 时）
 */
export declare function assessFileImpact(projectRoot: string, relativePath: string, recipeTokens: RecipeTokens): DiffImpactResult | null;
/**
 * 计算 diff tokens 与 Recipe tokens 的加权交集，返回影响级别。
 *
 * 分级：
 *   - score ≥ 0.3 → `pattern`（diff 动到了 30%+ 的 Recipe 关键标识符）
 *   - score > 0   → `reference`（diff 动到了部分 Recipe 标识符）
 *   - score === 0 → `reference`（兜底：至少有 sourceRef 关联）
 *
 * @param diffTokens  diff 变更行中的标识符集合
 * @param recipeTokens Recipe 的特征标识符
 */
export declare function assessDiffImpact(diffTokens: Set<string>, recipeTokens: RecipeTokens): DiffImpactResult;
/**
 * 统一影响评估入口 — 自动选择最佳 diff token 来源。
 *
 * 策略（按优先级）:
 *   1. git diff HEAD -U0 → 行级变更 token（最精确，实时变更场景）
 *   2. 文件全文 tokenize → 全文 token（hash diff 场景的降级）
 *
 * 两者最终都调用同一个 assessDiffImpact(diffTokens, recipeTokens)。
 * 全文模式精度较低（分母是整个文件），阈值从 0.3 提升到 0.5。
 *
 * @param projectRoot 项目根目录绝对路径
 * @param relativePath 相对于项目根的文件路径
 * @param recipeTokens 预提取的 Recipe 特征标识符
 * @returns 影响评估结果，或 null（文件不存在时）
 */
export declare function assessImpactUnified(projectRoot: string, relativePath: string, recipeTokens: RecipeTokens): DiffImpactResult | null;
