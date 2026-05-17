/**
 * WarningRepository — recipe_warnings 表 CRUD (Drizzle ORM)
 *
 * 持久化 KnowledgeMetabolism 产出的 RecipeWarning（contradiction / redundancy）。
 * 支持去重（同 target + type + related 组合仅保留最新）、按状态查询、批量解决。
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
export type WarningType = 'contradiction' | 'redundancy';
export type WarningStatus = 'open' | 'resolved' | 'dismissed';
export interface WarningRecord {
    id: string;
    type: WarningType;
    targetRecipeId: string;
    relatedRecipeIds: string[];
    confidence: number;
    description: string;
    evidence: string[];
    status: WarningStatus;
    detectedAt: number;
    resolvedAt: number | null;
    resolvedBy: string | null;
    resolution: string | null;
}
export interface CreateWarningInput {
    type: WarningType;
    targetRecipeId: string;
    relatedRecipeIds: string[];
    confidence: number;
    description: string;
    evidence: string[];
}
export interface WarningFilter {
    type?: WarningType;
    status?: WarningStatus | WarningStatus[];
    targetRecipeId?: string;
}
export declare class WarningRepository {
    #private;
    constructor(drizzle: DrizzleDB);
    /**
     * 创建或更新 warning（同 target + type + related 组合去重）。
     * 如果已存在同类型 open warning，更新 confidence/description/evidence/detectedAt。
     */
    upsert(input: CreateWarningInput): WarningRecord;
    /** 批量 upsert warnings */
    upsertBatch(inputs: CreateWarningInput[]): WarningRecord[];
    /** 解决一个 warning */
    resolve(id: string, resolution: string, resolvedBy?: string): boolean;
    /** 忽略一个 warning */
    dismiss(id: string, reason: string, dismissedBy?: string): boolean;
    /** 按 targetRecipeId 自动解决关联的 open warnings */
    resolveByTarget(targetRecipeId: string, resolution: string, resolvedBy?: string): number;
    findById(id: string): WarningRecord | null;
    find(filter?: WarningFilter, limit?: number): WarningRecord[];
    /** 统计 open warnings 数量 */
    countOpen(): {
        total: number;
        contradictions: number;
        redundancies: number;
    };
    /** 获取指定 Recipe 的 open warnings */
    findByTarget(targetRecipeId: string): WarningRecord[];
}
