import type { KnowledgeEntryWire } from '../../types/knowledge-wire.js';
import { Constraints, Content, Quality, Reasoning, Relations, Stats } from './values/index.js';
export interface KnowledgeEntryProps {
    id?: string;
    title?: string;
    description?: string;
    lifecycle?: string;
    lifecycleHistory?: Array<{
        from: string;
        to: string;
        at: number;
    }>;
    autoApprovable?: boolean;
    stagingDeadline?: number | null;
    language?: string;
    dimensionId?: string;
    category?: string;
    knowledgeType?: string;
    kind?: string;
    complexity?: string;
    scope?: string;
    difficulty?: string | null;
    tags?: string[];
    trigger?: string;
    topicHint?: string;
    whenClause?: string;
    doClause?: string;
    dontClause?: string;
    coreCode?: string;
    usageGuide?: string;
    content?: unknown;
    relations?: unknown;
    constraints?: unknown;
    reasoning?: unknown;
    quality?: unknown;
    stats?: unknown;
    headers?: string[];
    headerPaths?: string[];
    moduleName?: string;
    includeHeaders?: boolean;
    agentNotes?: string | null;
    aiInsight?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: number | null;
    rejectionReason?: string | null;
    source?: string;
    sourceFile?: string | null;
    sourceCandidateId?: string | null;
    createdBy?: string;
    createdAt?: number;
    updatedAt?: number;
    publishedAt?: number | null;
    publishedBy?: string | null;
    [key: string]: unknown;
}
export declare class KnowledgeEntry {
    id: string;
    title: string;
    description: string;
    lifecycle: string;
    lifecycleHistory: Array<{
        from: string;
        to: string;
        at: number;
        by?: string;
    }>;
    autoApprovable: boolean;
    stagingDeadline: number | null;
    language: string;
    dimensionId: string;
    category: string;
    knowledgeType: string;
    kind: string;
    complexity: string;
    scope: string;
    difficulty: string | null;
    tags: string[];
    trigger: string;
    topicHint: string;
    whenClause: string;
    doClause: string;
    dontClause: string;
    coreCode: string;
    usageGuide: string;
    content: Content;
    relations: Relations;
    constraints: Constraints;
    reasoning: Reasoning;
    quality: Quality;
    stats: Stats;
    headers: string[];
    headerPaths: string[];
    moduleName: string;
    includeHeaders: boolean;
    agentNotes: string | null;
    aiInsight: string | null;
    reviewedBy: string | null;
    reviewedAt: number | null;
    rejectionReason: string | null;
    source: string;
    sourceFile: string | null;
    sourceCandidateId: string | null;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    publishedAt: number | null;
    publishedBy: string | null;
    constructor(props?: KnowledgeEntryProps);
    /**
     * 发布 (pending|staging|evolving → active)
     */
    publish(publisher: string): {
        success: boolean;
        error?: string;
    };
    /**
     * 进入暂存期 (pending → staging)
     */
    stage(): {
        success: boolean;
        error?: string;
    };
    /**
     * 进入进化态 (active → evolving)
     */
    evolve(): {
        success: boolean;
        error?: string;
    };
    /**
     * 进入衰退观察 (active|evolving → decaying)
     */
    decay(): {
        success: boolean;
        error?: string;
    };
    /**
     * 恢复为已发布 (decaying|evolving → active)，不更新 publishedAt
     */
    restore(): {
        success: boolean;
        error?: string;
    };
    /**
     * 弃用 (pending|active|decaying → deprecated)
     */
    deprecate(reason: string): {
        success: boolean;
        error?: string;
    };
    /**
     * 重新激活 (deprecated|staging → pending)
     */
    reactivate(): {
        success: boolean;
        error?: string;
    };
    /**
     * 将最后一条 lifecycleHistory 条目标记操作人。
     * 由 KnowledgeService._lifecycleTransition() 在 entity method 执行后调用。
     */
    stampLastTransition(by: string): void;
    /** 是否处于候选阶段 */
    isCandidate(): boolean;
    /** 是否可被 Guard/Search/Export 消费 */
    isActive(): boolean;
    /** 是否为 Guard 规则类型 */
    isRule(): boolean;
    /** 内容是否有效 */
    isValid(): boolean;
    /** 返回此 Entry 中可被 GuardCheckEngine 消费的规则列表 */
    getGuardRules(): ({
        id: string;
        type: string;
        name: string;
        message: string;
        pattern: string | null;
        languages: string[];
        severity: "error" | "info" | "warning";
        source: string;
        fixSuggestion: string | null;
    } | {
        id: string;
        type: string;
        name: string;
        message: string;
        astQuery: Record<string, unknown> | null;
        languages: {}[];
        severity: "error" | "info" | "warning";
        source: string;
        fixSuggestion: string | null;
    })[];
    /** 系统内部标签前缀 — 内部元数据，不应暴露给最终用户 */
    static SYSTEM_TAG_PREFIXES: string[];
    /** 判断是否为系统内部标签 */
    static isSystemTag(tag: string): boolean;
    /**
     * Domain → JSON (camelCase 直出，全链路统一)
     * 注意: tags 保留原始值（含系统标签），对外 API 使用 sanitizeForAPI() 过滤
     */
    toJSON(): KnowledgeEntryWire;
    /** JSON → Domain (camelCase 直入) */
    static fromJSON(data: unknown): KnowledgeEntry;
    /** @returns } */
    _transition(to: string, by?: string): {
        success: boolean;
        error?: string;
    };
    _now(): number;
}
export default KnowledgeEntry;
