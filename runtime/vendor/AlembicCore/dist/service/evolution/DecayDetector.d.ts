/**
 * DecayDetector — 知识衰退检测 + 评分
 *
 * 6 种衰退检测策略（任一满足即触发 decaying 转换）：
 *   1. daysSinceLastHit > 90 — 90 天无使用
 *   2. ruleFalsePositiveRate > 0.4 && triggers > 10 — 规则已不准
 *   3. ReverseGuard: coreCode 引用的 API 符号已删除
 *   3b. SourceRefReconciler: 来源文件路径失效（recipe_source_refs.status = stale）
 *   4. 同域新 Recipe 发布且 deprecated_by 关系指向它
 *   5. 矛盾检测: Agent 在 evolve 流程中语义判断
 *
 * 衰退评分 (decayScore 0-100):
 *   freshness(0.3) + usage(0.3) + quality(0.2) + authority(0.2)
 *
 *   80-100: 健康 → 不转换
 *   60-79:  关注 → Dashboard 警告
 *   40-59:  衰退 → active → decaying
 *   20-39:  严重 → Grace Period 缩短到 15d
 *   0-19:   死亡 → 跳过确认直接 deprecated
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { RecipeSourceRefRepositoryImpl } from '../../repository/sourceref/RecipeSourceRefRepository.js';
export interface DecaySignal {
    recipeId: string;
    strategy: DecayStrategy;
    detail: string;
}
export type DecayStrategy = 'no_recent_usage' | 'high_false_positive' | 'symbol_drift' | 'source_ref_stale' | 'superseded' | 'contradiction';
export interface DecayScoreResult {
    recipeId: string;
    title: string;
    decayScore: number;
    level: 'healthy' | 'watch' | 'decaying' | 'severe' | 'dead';
    signals: DecaySignal[];
    dimensions: {
        freshness: number;
        usage: number;
        quality: number;
        authority: number;
    };
    /** 建议的 Grace Period (ms)。severe=15d，dead=0 */
    suggestedGracePeriod: number;
}
interface RecipeForDecay {
    id: string;
    title: string;
    lifecycle: string;
    stats: string | null;
    quality_grade: string | null;
    quality_score: number | null;
    created_at: number | null;
}
export declare class DecayDetector {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, options?: {
        signalBus?: SignalBus;
        knowledgeEdgeRepo?: KnowledgeEdgeRepositoryImpl;
        sourceRefRepo?: RecipeSourceRefRepositoryImpl;
        drizzle?: DrizzleDB;
    });
    /**
     * 扫描所有 active 条目的衰退状态
     */
    scanAll(): Promise<DecayScoreResult[]>;
    /**
     * 评估单条 Recipe 的衰退状态
     */
    evaluate(recipe: RecipeForDecay): Promise<DecayScoreResult>;
}
export {};
