/**
 * §10.1 KnowledgeEntryWire — 统一的知识条目传输合约
 *
 * 这是后端 KnowledgeEntry.toJSON() 和前端 Dashboard 共享的唯一类型定义。
 * 所有 API 层传输都使用此形状，消除后端 class 与前端 interface 的字段漂移。
 */
export type KnowledgeLifecycle = 'pending' | 'staging' | 'active' | 'evolving' | 'decaying' | 'deprecated';
export type KnowledgeKind = 'rule' | 'pattern' | 'fact';
export interface KnowledgeContentWire {
    pattern: string;
    markdown: string;
    rationale: string;
    steps: Array<{
        title?: string;
        description?: string;
        code?: string;
    }>;
    codeChanges: Array<{
        file: string;
        before: string;
        after: string;
        explanation: string;
    }>;
    verification: {
        method?: string;
        expectedResult?: string;
        testCode?: string;
    } | null;
}
export interface KnowledgeReasoningWire {
    whyStandard: string;
    sources: string[];
    confidence: number;
    qualitySignals: Record<string, unknown>;
    alternatives: string[];
}
export interface KnowledgeQualityWire {
    completeness: number;
    adaptation: number;
    documentation: number;
    overall: number;
    grade: string;
}
export interface KnowledgeStatsWire {
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
}
export interface KnowledgeConstraintsWire {
    guards: Array<{
        id?: string | null;
        type?: string;
        pattern: string | null;
        severity: string;
        message?: string;
        fixSuggestion?: string;
    }>;
    boundaries: string[];
    preconditions: string[];
    sideEffects: string[];
}
export interface KnowledgeRelationEntry {
    target: string;
    description?: string;
}
export interface KnowledgeRelationsWire {
    [bucket: string]: KnowledgeRelationEntry[];
}
/** 后端 → 前端 / API 传输的唯一合约 */
export interface KnowledgeEntryWire {
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
    language: string;
    dimensionId: string;
    category: string;
    kind: string;
    knowledgeType: string;
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
    content: KnowledgeContentWire;
    relations: KnowledgeRelationsWire;
    constraints: KnowledgeConstraintsWire;
    reasoning: KnowledgeReasoningWire;
    quality: KnowledgeQualityWire;
    stats: KnowledgeStatsWire;
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
    [key: string]: unknown;
}
