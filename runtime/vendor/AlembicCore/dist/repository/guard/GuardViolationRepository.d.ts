/**
 * GuardViolationRepository — Guard 违反记录的仓储实现
 *
 * 从 ViolationsStore 提取的数据操作，
 * 使用 Drizzle 类型安全 API 操作 guard_violations 表。
 */
import { guardViolations } from '../../infrastructure/database/drizzle/schema.js';
import { RepositoryBase } from '../base/RepositoryBase.js';
export interface ViolationRecord {
    ruleId?: string;
    severity?: string;
    message?: string;
    line?: number;
    [key: string]: unknown;
}
export interface GuardViolationEntity {
    id: string;
    filePath: string;
    triggeredAt: string;
    violationCount: number;
    summary: string;
    violations: ViolationRecord[];
    createdAt: number;
}
export interface GuardViolationInsert {
    id: string;
    filePath: string;
    triggeredAt: string;
    violationCount: number;
    summary?: string;
    violations: ViolationRecord[];
    createdAt: number;
}
export interface ViolationStats {
    totalRuns: number;
    totalViolations: number;
    averageViolationsPerRun: string | number;
    lastRunAt: string | null;
}
export interface ViolationStatByRule {
    ruleId: string | null;
    severity: string | null;
    count: number;
}
export interface PaginatedViolations {
    data: GuardViolationEntity[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export declare class GuardViolationRepositoryImpl extends RepositoryBase<typeof guardViolations, GuardViolationEntity> {
    #private;
    /** 最大保留条数 */
    static readonly MAX_RUNS = 200;
    constructor(drizzle: ConstructorParameters<typeof RepositoryBase<typeof guardViolations, GuardViolationEntity>>[0]);
    findById(id: string): Promise<GuardViolationEntity | null>;
    create(data: GuardViolationInsert): Promise<GuardViolationEntity>;
    delete(id: string): Promise<boolean>;
    /** 获取指定文件的最近一条记录 (用于去重比较) */
    getLastByFile(filePath: string): Promise<{
        id: string;
        violationsJson: string;
    } | null>;
    /** 刷新已有记录的时间戳 (去重命中时) */
    refreshTimestamp(id: string): Promise<void>;
    /** 获取所有运行记录 (最旧在前) */
    getRuns(): Promise<GuardViolationEntity[]>;
    /** 按文件路径查询 */
    getRunsByFile(filePath: string): Promise<GuardViolationEntity[]>;
    /** 获取最近 N 条记录 */
    getRecentRuns(n?: number): Promise<GuardViolationEntity[]>;
    /** 分页查询 */
    list(filters?: {
        file?: string;
    }, options?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedViolations>;
    /** 获取统计汇总 */
    getStats(): Promise<ViolationStats>;
    /**
     * 按规则 ID 聚合统计
     * 利用 SQLite json_each 展开 violations_json 数组
     *
     * json_each 是 SQLite 专有函数，Drizzle 无 typed API (ORM limitation)
     */
    getStatsByRule(): Promise<ViolationStatByRule[]>;
    /** 截断超限记录，保留最新 maxRuns 条 */
    enforceCapacity(maxRuns?: number): Promise<number>;
    /** 清空所有记录 */
    clearAll(): Promise<void>;
    /** 清除指定文件的记录 */
    clearByFile(filePath: string): Promise<number>;
    /**
     * 最近的 violation JSON 列表 (CoverageAnalyzer.#getRecentViolations)
     */
    findRecentViolationsJson(limit: number): Array<{
        filePath: string;
        violationsJson: string;
    }>;
}
