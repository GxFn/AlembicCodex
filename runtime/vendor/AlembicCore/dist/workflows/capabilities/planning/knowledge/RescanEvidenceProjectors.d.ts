import type { DimensionDef } from '../../../../types/project-snapshot.js';
import type { RecipeSnapshotEntry } from '../../RecipeSnapshotTypes.js';
import type { AuditVerdict, KnowledgeRescanExecutionDecision, KnowledgeRescanPlan, RescanExecutionMode, RescanExecutionReason } from './KnowledgeRescanPlanBuilder.js';
import type { RelevanceAuditSummary } from './KnowledgeRescanPlanner.js';
export interface InternalRescanGapPlan {
    requestedDimensions: DimensionDef[];
    executionDecisions: KnowledgeRescanExecutionDecision[];
    executionDimensions: DimensionDef[];
    produceDimensions: DimensionDef[];
    gapDimensions: DimensionDef[];
    skippedDimensions: DimensionDef[];
    coverageByDimension: Record<string, number>;
    auditVerdictMap: Map<string, AuditVerdict>;
    executionReasons: Record<string, RescanExecutionReason[]>;
    targetPerDimension: number;
}
export interface ExternalDimensionGap {
    dimensionId: string;
    existingCount: number;
    gap: number;
    executionMode: RescanExecutionMode;
    createBudget: number;
    shouldExecute: boolean;
    existingTriggers: string[];
    executionReasons: RescanExecutionReason[];
}
export interface ExternalRescanEvidencePlan {
    allRecipes: Array<{
        id: string;
        title: string;
        trigger: string;
        dimensionId: string;
        knowledgeType: string;
        doClause: string;
        lifecycle: string;
        content: {
            markdown: string;
            rationale: string;
            coreCode: string;
        } | null;
        sourceRefs: string[];
        auditHint: {
            relevanceScore: number;
            verdict: 'healthy' | 'watch' | 'decay' | 'severe';
            decayReasons: string[];
        };
    }>;
    dimensionGaps: ExternalDimensionGap[];
    executionReasons: Record<string, RescanExecutionReason[]>;
    totalGap: number;
    totalCreateBudget: number;
    decayCount: number;
    occupiedTriggers: string[];
    coveredDimensions: number;
    gapSummary: string;
}
export declare function projectInternalRescanGapPlan(plan: KnowledgeRescanPlan): InternalRescanGapPlan;
export declare function projectInternalRescanPromptRecipes(plan: KnowledgeRescanPlan): {
    id: string;
    title: string;
    trigger: string;
    dimensionId: string;
    knowledgeType: string;
    status: "decaying" | "healthy";
    decayReason?: string;
    auditScore?: number;
    content?: {
        markdown?: string;
        rationale?: string;
        coreCode?: string;
    };
    sourceRefs?: string[];
    auditEvidence?: Record<string, unknown>;
}[];
export declare function projectInternalRescanPromptRecipesFromParts(opts: {
    recipeEntries: RecipeSnapshotEntry[];
    auditSummary: RelevanceAuditSummary;
    auditVerdictMap: Map<string, AuditVerdict>;
}): Array<{
    id: string;
    title: string;
    trigger: string;
    dimensionId: string;
    knowledgeType: string;
    status: 'decaying' | 'healthy';
    decayReason?: string;
    auditScore?: number;
    content?: {
        markdown?: string;
        rationale?: string;
        coreCode?: string;
    };
    sourceRefs?: string[];
    auditEvidence?: Record<string, unknown>;
}>;
export declare function projectExternalRescanEvidencePlan(plan: KnowledgeRescanPlan): ExternalRescanEvidencePlan;
