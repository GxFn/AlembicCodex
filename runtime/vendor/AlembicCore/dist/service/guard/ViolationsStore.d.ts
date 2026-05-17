/**
 * ViolationsStore — Guard 违反记录存储（DB 版）
 * 记录每次 as:audit 运行的审计结果，持久化到 SQLite guard_violations 表。
 * 最多保留 200 条。
 *
 * 所有操作使用 Drizzle 类型安全 API（零 raw SQL）。
 */
import { type DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
interface ViolationRecord {
    ruleId?: string;
    severity?: string;
    message?: string;
    line?: number;
    [key: string]: unknown;
}
interface RunInput {
    filePath?: string;
    violations?: ViolationRecord[];
    summary?: string;
}
interface RunOutput {
    id: string;
    filePath: string;
    triggeredAt: string;
    violations: ViolationRecord[];
    violationCount: number;
    summary: string;
}
export declare class ViolationsStore {
    #private;
    /** @param _db 保留签名兼容 (不再使用) */
    constructor(_db: unknown, drizzle?: DrizzleDB);
    /**
     * 追加一次 Guard 运行记录
     * ★ 去重：同一文件、同一违规集合不重复入库，仅更新时间戳
     * ★ 全 Drizzle 类型安全
     */
    appendRun(run: RunInput): string;
    /**
     * 获取所有运行记录（最新在后）
     */
    getRuns(): RunOutput[];
    /**
     * 按文件路径查询历史
     */
    getRunsByFile(filePath: string): RunOutput[];
    /**
     * 获取最近 N 条记录
     */
    getRecentRuns(n?: number): RunOutput[];
    /** 获取统计汇总 */
    getStats(): {
        totalRuns: number;
        totalViolations: number;
        averageViolationsPerRun: string | number;
        lastRunAt: string | null;
    };
    /**
     * 按规则 ID 聚合统计
     * 利用 SQLite json_each 展开 violations_json 数组
     *
     * json_each 是 SQLite 专有函数，Drizzle 无 typed API (ORM limitation)
     */
    getStatsByRule(): {
        ruleId: string | null;
        severity: string | null;
        count: number;
    }[];
    /**
     * 获取趋势数据 — 对比最近两次运行
     */
    getTrend(): {
        errorsChange: number;
        warningsChange: number;
        latestErrors: number;
        latestWarnings: number;
        previousErrors: number;
        previousWarnings: number;
        hasHistory: boolean;
    };
    /** 清空所有记录 */
    clearRuns(): void;
    /** 清除指定规则或文件的记录 */
    clearAll(): Promise<void>;
    clear({ ruleId, file }?: {
        ruleId?: string;
        file?: string;
    }): Promise<void>;
    /** 分页查询 */
    list(filters?: {
        file?: string;
    }, { page, limit }?: {
        page?: number | undefined;
        limit?: number | undefined;
    }): Promise<{
        data: RunOutput[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
export {};
