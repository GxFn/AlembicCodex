/**
 * ReportStore — 报告持久化服务
 *
 * 管道产物（governance / compliance / metrics / analysis）写入 JSONL，
 * 供 API 查询历史报告。
 *
 * @module infrastructure/report/ReportStore
 */
import type { WriteZone } from '../io/index.js';
export type ReportCategory = 'governance' | 'compliance' | 'metrics' | 'analysis';
export interface ReportEntry {
    /** 自动生成 `rpt-{date}-{rand}` */
    id: string;
    category: ReportCategory;
    /** 如 'metabolism_cycle', 'redundancy_report' */
    type: string;
    /** 生产者类名 */
    producer: string;
    data: Record<string, unknown>;
    timestamp: number;
    duration_ms?: number;
}
export interface ReportQueryOptions {
    category?: ReportCategory[];
    type?: string;
    from?: number;
    to?: number;
    limit?: number;
    offset?: number;
}
export declare class ReportStore {
    #private;
    constructor(baseDir: string, writeZone?: WriteZone);
    /** 写入一条报告（追加 JSONL） */
    write(entry: Omit<ReportEntry, 'id'>): Promise<ReportEntry>;
    /** 查询报告列表 */
    query(opts?: ReportQueryOptions): Promise<{
        reports: ReportEntry[];
        total: number;
    }>;
    /** 分类统计 */
    stats(opts?: {
        from?: number;
        to?: number;
    }): Promise<Record<string, number>>;
}
