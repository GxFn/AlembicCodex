import type { RelevanceAuditSummary } from './KnowledgeRescanPlanner.js';
export interface PrescreenNeedsVerification {
    recipeId: string;
    title: string;
    dimension: string;
    relevanceVerdict: 'decay' | 'severe' | 'watch';
    relevanceScore: number;
    auditHint: string;
    decayReasons: string[];
}
export interface PrescreenAutoResolved {
    recipeId: string;
    resolution: 'auto-skip' | 'auto-deprecated';
    reason: string;
}
export interface DimensionGapInfo {
    target: number;
    healthy: number;
    observing: number;
    gap: number;
}
export interface EvolutionPrescreen {
    needsVerification: PrescreenNeedsVerification[];
    autoResolved: PrescreenAutoResolved[];
    dimensionGaps: Record<string, DimensionGapInfo>;
}
export declare function buildEvolutionPrescreen(auditSummary: RelevanceAuditSummary, snapshotEntries: Array<{
    id: string;
    title: string;
    dimensionId?: string;
    category?: string;
    lifecycle: string;
    knowledgeType: string;
    trigger: string;
}>, dimensions: Array<{
    id: string;
    knowledgeTypes?: string[];
}>): EvolutionPrescreen;
