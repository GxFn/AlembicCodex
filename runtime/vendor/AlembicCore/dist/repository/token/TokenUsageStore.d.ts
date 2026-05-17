/**
 * TokenUsageStore — Token 消耗持久化存储 (Drizzle ORM)
 *
 * 写入 AI 调用的 token 用量记录到 SQLite token_usage 表。
 * 提供近 7 日按日/按来源的聚合查询。
 *
 * Drizzle 迁移策略：
 * - INSERT 使用 drizzle 类型安全 API（列名编译期检查）
 * - 聚合查询保留预编译 raw SQL（DATE() / GROUP BY computed-column
 *   在 drizzle query builder 中不够直观，保持原有高效预编译语句）
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
/** Token usage record input */
interface TokenRecord {
    source: string;
    dimension?: string;
    provider?: string;
    model?: string;
    inputTokens: number;
    outputTokens: number;
    durationMs?: number;
    toolCalls?: number;
    sessionId?: string;
}
/** Daily aggregation row */
interface DailyRow {
    date: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    call_count: number;
}
/** Source aggregation row */
interface BySourceRow {
    source: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    call_count: number;
}
/** Summary row */
interface SummaryRow {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    call_count: number;
}
/** 7-day report data */
interface ReportData {
    daily: DailyRow[];
    bySource: BySourceRow[];
    summary: SummaryRow & {
        avg_per_call: number;
    };
}
export declare class TokenUsageStore {
    #private;
    /** @param db — raw better-sqlite3 instance */
    constructor(db: import('better-sqlite3').Database, drizzle?: DrizzleDB);
    /**
     * 记录一次 AI 调用的 token 消耗
     * ★ 使用 drizzle 类型安全 INSERT — 列名拼写编译期检查
     */
    record(record: TokenRecord): void;
    /**
     * 近 7 日按日聚合统计
     * @returns >}
     */
    getLast7DaysDaily(): DailyRow[];
    /**
     * 近 7 日按来源 (source) 聚合统计
     * @returns >}
     */
    getLast7DaysBySource(): BySourceRow[];
    /**
     * 近 7 日总计
     * @returns }
     */
    getLast7DaysSummary(): SummaryRow & {
        avg_per_call: number;
    };
    /**
     * 获取完整的 7 日报告（前端一次拉取）
     * 带 10s 内存缓存，避免高频请求重复查询
     */
    getLast7DaysReport(): ReportData;
}
export {};
