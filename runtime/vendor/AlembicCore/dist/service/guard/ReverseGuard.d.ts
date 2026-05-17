/**
 * ReverseGuard — Recipe→Code 反向验证
 *
 * 正向: 代码 → Guard → "代码是否符合知识？"  ✅ 已有
 * 反向: Recipe → Guard → "知识是否还符合代码？" ← 本文件
 *
 * 对每条 active rule Recipe:
 *   1. 提取 coreCode 中的 API 引用（类名、方法名）
 *   2. 在 code_entities 表中查找这些符号
 *   3. 符号不存在 → PatternDrift
 *   4. 提取 guard regex pattern → 对项目代码运行匹配
 *   5. 匹配率骤降 → 代码模式正在迁移
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeRepositoryImpl } from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { RecipeSourceRefRepositoryImpl } from '../../repository/sourceref/RecipeSourceRefRepository.js';
export type DriftType = 'symbol_missing' | 'match_rate_drop' | 'api_deprecated' | 'zero_match' | 'source_ref_stale';
export type DriftSeverity = 'high' | 'medium' | 'low';
export interface PatternDriftSignal {
    type: DriftType;
    detail: string;
    severity: DriftSeverity;
    evidence: {
        expectedSymbol?: string;
        matchRate?: {
            current: number;
            historical: number;
        };
    };
}
export type ReverseRecommendation = 'healthy' | 'investigate' | 'decay';
export interface ReverseGuardResult {
    recipeId: string;
    title: string;
    signals: PatternDriftSignal[];
    recommendation: ReverseRecommendation;
}
interface RecipeRow {
    id: string;
    title: string;
    core_code: string | null;
    guard_pattern: string | null;
    stats: string | null;
}
export declare class ReverseGuard {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, entityRepo: CodeEntityRepositoryImpl, sourceRefRepo: RecipeSourceRefRepositoryImpl, options?: {
        signalBus?: SignalBus;
    });
    /**
     * 对一条 Recipe 执行反向验证
     */
    checkRecipe(recipe: RecipeRow, projectFiles: {
        path: string;
        content: string;
    }[]): ReverseGuardResult;
    /**
     * 批量对所有 active rule Recipes 执行反向验证
     */
    auditAllRules(projectFiles: {
        path: string;
        content: string;
    }[]): ReverseGuardResult[];
    /**
     * 获取需要调查/衰退的 Recipe 结果
     */
    getDriftResults(results: ReverseGuardResult[]): ReverseGuardResult[];
}
export {};
