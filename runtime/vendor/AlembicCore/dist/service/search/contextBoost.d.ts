/**
 * contextBoost — 会话上下文感知排序加成
 *
 * 从 SearchEngine._contextBoost 统一提取。
 *
 * 规则:
 *   - 会话历史关键词重叠 → +20% (最多 5 个词满分)
 *   - 语言匹配            → +10%
 *
 * @module contextBoost
 */
/**
 * @param items 已排序的候选列表（需有 rankerScore / coarseScore / score）
 * @param [context.sessionHistory]
 * @returns 含 contextScore / contextBoost 字段的排序列表
 */
export interface SearchItem {
    title?: string;
    trigger?: string;
    content?: string;
    language?: string;
    rankerScore?: number;
    coarseScore?: number;
    score?: number;
    [key: string]: unknown;
}
export interface SearchContext {
    sessionHistory?: Array<{
        content?: string;
        rawInput?: string;
    }>;
    language?: string;
}
export declare function contextBoost(items: SearchItem[], context?: SearchContext): SearchItem[] | {
    contextScore: number;
    contextBoost: number;
    title?: string;
    trigger?: string;
    content?: string;
    language?: string;
    rankerScore?: number;
    coarseScore?: number;
    score?: number;
}[];
