/**
 * FeedbackCollector — 用户反馈收集器
 * 记录交互事件 (view/click/rate/dismiss)，可持久化，支持统计汇总
 * 持久化到 Alembic/feedback.json（Git 友好）
 */
import type { WriteZone } from '../../infrastructure/io/index.js';
interface FeedbackCollectorOptions {
    knowledgeBaseDir?: string;
    maxEvents?: number;
    internalDir?: string;
    wz?: WriteZone;
}
export declare class FeedbackCollector {
    #private;
    constructor(projectRoot: string, options?: FeedbackCollectorOptions);
    /**
     * 记录一个交互事件
     * @param data 任意附加数据 (rating, comment, etc.)
     */
    record(type: string, recipeId: string, data?: Record<string, unknown>): void;
    /**
     * 获取指定 Recipe 的事件统计
     * @returns }
     */
    getRecipeStats(recipeId: string): {
        views: number;
        clicks: number;
        copies: number;
        avgRating: number;
        feedbackCount: number;
        totalEvents: number;
    };
    /** 获取全局统计 */
    getGlobalStats(): {
        totalEvents: number;
        byType: Record<string, number>;
        uniqueRecipes: number;
    };
    /** 获取热门 Recipes (by interaction count) */
    getTopRecipes(n?: number): {
        recipeId: string;
        count: number;
    }[];
    /** 清空记录 */
    clear(): void;
}
export {};
