/**
 * Stats — 统计值对象
 *
 * 记录知识条目的使用统计：浏览、采用、应用、Guard 命中、搜索命中、权威分。
 *
 * Phase 0 扩展：新增时间戳、滑窗统计、版本号、FP 率字段。
 * 新字段均有默认值，与旧 JSON 100% 向后兼容。
 */
type StatsCounter = 'views' | 'adoptions' | 'applications' | 'guardHits' | 'searchHits';
interface StatsProps {
    views?: number;
    adoptions?: number;
    applications?: number;
    guardHits?: number;
    searchHits?: number;
    authority?: number;
    lastHitAt?: number | null;
    lastSearchedAt?: number | null;
    lastGuardHitAt?: number | null;
    hitsLast30d?: number;
    hitsLast90d?: number;
    searchHitsLast30d?: number;
    version?: number;
    ruleFalsePositiveRate?: number | null;
}
export declare class Stats {
    adoptions: number;
    applications: number;
    authority: number;
    guardHits: number;
    searchHits: number;
    views: number;
    lastHitAt: number | null;
    lastSearchedAt: number | null;
    lastGuardHitAt: number | null;
    hitsLast30d: number;
    hitsLast90d: number;
    searchHitsLast30d: number;
    version: number;
    ruleFalsePositiveRate: number | null;
    constructor(props?: StatsProps);
    /** 从任意输入构造 Stats */
    static from(input: unknown): Stats;
    /** 增加计数 */
    increment(counter: StatsCounter, delta?: number): Stats;
    /** 记录一次命中，同时更新时间戳（Unix 秒） */
    recordHit(counter: StatsCounter, timestamp?: number): Stats;
    /** 转换为 JSON */
    toJSON(): {
        views: number;
        adoptions: number;
        applications: number;
        guardHits: number;
        searchHits: number;
        authority: number;
        lastHitAt: number | null;
        lastSearchedAt: number | null;
        lastGuardHitAt: number | null;
        hitsLast30d: number;
        hitsLast90d: number;
        searchHitsLast30d: number;
        version: number;
        ruleFalsePositiveRate: number | null;
    };
    /** 从 wire format 创建 */
    static fromJSON(data: unknown): Stats;
}
export default Stats;
