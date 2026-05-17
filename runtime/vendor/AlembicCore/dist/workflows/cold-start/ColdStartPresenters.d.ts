import type { DimensionDef, MissionBriefingResult, ProjectSnapshot } from '../../types/project-snapshot.js';
import type { CleanupResult } from '../capabilities/RecipeSnapshotTypes.js';
export type ColdStartTargetFileMap = Record<string, Array<Record<string, unknown>>>;
export declare function presentInternalColdStartEmptyProject({ report, responseTimeMs, }: {
    report: unknown;
    responseTimeMs: number;
}): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: {
        report: unknown;
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
export declare function presentExternalColdStartEmptyProject({ responseTimeMs, }: {
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
export declare function buildInternalColdStartTargetFileMap(snapshot: ProjectSnapshot, contentMaxLines: number): ColdStartTargetFileMap;
export declare function buildInternalColdStartReport({ snapshot, maxFiles, skipGuard, }: {
    snapshot: ProjectSnapshot;
    maxFiles: number;
    skipGuard: boolean;
}): {
    phases: {
        fileCollection: {
            discoverer: string;
            discovererName: string;
            targets: number;
            files: number;
            truncated: boolean;
        };
        incrementalEvaluation: undefined;
        astAnalysis: {
            classes: number;
            protocols: number;
            categories: number;
            patterns: string[];
        };
        codeEntityGraph: Record<string, unknown>;
        callGraph: {
            entities: {};
            edges: {};
            ms: {};
        };
        dependencyGraph: {
            edgesWritten: number;
        };
        enhancementPacks: {
            matched: readonly import("../../types/project-snapshot.js").EnhancementPackInfo[];
            extraDimensions: number;
            guardRules: number;
            patterns: number;
        };
        guardAudit: {
            totalViolations: number;
            filesWithViolations: number;
            skipped: boolean;
            enhancementRulesInjected: number;
        };
    };
    totals: {
        files: number;
        graphEdges: number;
        guardViolations: number;
    };
};
export interface InternalColdStartResponseInput {
    cleanupResult: CleanupResult;
    snapshot: ProjectSnapshot;
    report: Record<string, unknown>;
    targetFileMap: ColdStartTargetFileMap;
    dimensions: DimensionDef[];
    cachedSessionId: string | null;
    taskCount: number;
    bootstrapSession: {
        toJSON(): Record<string, unknown>;
    } | null;
    responseTimeMs: number;
}
export declare function presentInternalColdStartResponse({ cleanupResult, snapshot, report, targetFileMap, dimensions, cachedSessionId, taskCount, bootstrapSession, responseTimeMs, }: InternalColdStartResponseInput): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: Record<string, unknown> | null;
    meta: {
        [key: string]: unknown;
        responseTimeMs?: number;
        tool?: string;
        source?: string;
        version?: string;
    };
};
export declare function presentExternalColdStartResponse({ cleanupResult, briefing, dimensionCount, responseTimeMs, }: {
    cleanupResult: CleanupResult;
    briefing: MissionBriefingResult;
    dimensionCount: number;
    responseTimeMs: number;
}): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: {
        meta?: {
            warnings?: string[];
            responseSizeKB?: number;
            [key: string]: unknown;
        };
        cleanup: {
            deletedRecipes: number;
            clearedTables: number;
            dbCleared: boolean;
            errors: string[];
            trash: {
                folder: string;
                movedItems: number;
                dbSnapshotRows: number;
            } | null;
            purgedTrash: {
                count: number;
                freedBytes: number;
            } | null;
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
