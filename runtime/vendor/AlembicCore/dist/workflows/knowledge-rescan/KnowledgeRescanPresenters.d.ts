import type { DimensionDef, ProjectSnapshot } from '../../types/project-snapshot.js';
import type { ExternalRescanEvidencePlan, InternalRescanGapPlan, RelevanceAuditSummary } from '../capabilities/planning/knowledge/KnowledgeRescanPlanner.js';
import type { CleanupResult, RecipeSnapshot } from '../capabilities/RecipeSnapshotTypes.js';
export type KnowledgeRescanTargetFileMap = Record<string, Array<Record<string, unknown>>>;
export declare function presentInternalKnowledgeRescanEmptyProject({ responseTimeMs, }: {
    responseTimeMs: number;
}): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: {
        message: string;
    } | null;
    meta: {
        [key: string]: unknown;
        responseTimeMs?: number;
        tool?: string;
        source?: string;
        version?: string;
    };
};
export declare function presentExternalKnowledgeRescanEmptyProject({ responseTimeMs, }: {
    responseTimeMs: number;
}): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: {
        message: string;
    } | null;
    meta: {
        [key: string]: unknown;
        responseTimeMs?: number;
        tool?: string;
        source?: string;
        version?: string;
    };
};
export declare function buildInternalKnowledgeRescanTargetFileMap(snapshot: ProjectSnapshot, contentMaxLines: number): KnowledgeRescanTargetFileMap;
export declare function presentInternalKnowledgeRescanResponse({ recipeSnapshot, cleanResult, auditSummary, gapPlan, snapshot, bootstrapSession, sessionId, evolutionAudit, reason, responseTimeMs, }: {
    recipeSnapshot: RecipeSnapshot;
    cleanResult: CleanupResult;
    auditSummary: RelevanceAuditSummary;
    gapPlan: InternalRescanGapPlan;
    snapshot: ProjectSnapshot;
    bootstrapSession: {
        toJSON(): Record<string, unknown>;
    } | null;
    sessionId: string | null;
    evolutionAudit?: {
        proposed: number;
        deprecated: number;
        skipped: number;
        iterations: number;
        toolCalls: number;
    } | null;
    reason?: string | null;
    responseTimeMs: number;
}): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: {
        rescan: {
            preservedRecipes: number;
            cleanedTables: number;
            cleanedFiles: number;
            reason: string | null;
        };
        relevanceAudit: {
            totalAudited: number;
            healthy: number;
            watch: number;
            decay: number;
            severe: number;
            dead: number;
            proposalsCreated: number;
            immediateDeprecated: number;
        };
        evolutionAudit: {
            proposed: number;
            deprecated: number;
            skipped: number;
            iterations: number;
            toolCalls: number;
        } | null;
        gapAnalysis: {
            totalDimensions: number;
            executionDimensions: number;
            produceDimensions: number;
            gapDimensions: number;
            skippedDimensions: string[];
            targetPerDimension: number;
            executionReasons: Record<string, import("../capabilities/planning/knowledge/KnowledgeRescanPlanBuilder.js").RescanExecutionReason[]>;
            executionDecisions: {
                dimensionId: string;
                mode: import("../capabilities/planning/knowledge/KnowledgeRescanPlanBuilder.js").RescanExecutionMode;
                existing: number;
                gap: number;
                createBudget: number;
                reasons: import("../capabilities/planning/knowledge/KnowledgeRescanPlanBuilder.js").RescanExecutionReasonKind[];
            }[];
            gaps: {
                dimensionId: string;
                label: string | undefined;
                existing: number;
                gap: number;
            }[];
        };
        languageStats: Record<string, number>;
        primaryLanguage: string;
        guardSummary: {
            totalViolations: number;
            errors: number;
            warnings: number;
        } | null;
        astSummary: {
            classes: number;
            protocols: number;
            categories: number;
        } | null;
        codeEntityGraph: {
            totalEntities: number;
            totalEdges: number;
        } | null;
        callGraph: {
            entitiesUpserted: number;
            edgesCreated: number;
        } | null;
        panorama: Record<string, unknown> | null;
        bootstrapSession: Record<string, unknown> | null;
        sessionId: string | null;
        asyncFill: boolean;
        status: string;
        files: number;
        targets: number;
    } | null;
    meta: {
        [key: string]: unknown;
        responseTimeMs?: number;
        tool?: string;
        source?: string;
        version?: string;
    };
};
export declare function presentExternalKnowledgeRescanResponse({ recipeSnapshot, cleanResult, auditSummary, briefing, evidencePlan, dimensions, reason, responseTimeMs, }: {
    recipeSnapshot: RecipeSnapshot;
    cleanResult: CleanupResult;
    auditSummary: RelevanceAuditSummary;
    briefing: Record<string, unknown>;
    evidencePlan: ExternalRescanEvidencePlan;
    dimensions: DimensionDef[];
    reason?: string | null;
    responseTimeMs: number;
}): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: {
        rescan: {
            preservedRecipes: number;
            cleanedTables: number;
            cleanedFiles: number;
            reason: string | null;
        };
        relevanceAudit: {
            totalAudited: number;
            healthy: number;
            watch: number;
            decay: number;
            severe: number;
            dead: number;
            proposalsCreated: number;
            immediateDeprecated: number;
        };
    } | null;
    meta: {
        [key: string]: unknown;
        responseTimeMs?: number;
        tool?: string;
        source?: string;
        version?: string;
    };
};
