import type { DimensionDef, ProjectSnapshot } from '../../types/project-snapshot.js';
import type { ProjectAnalysisMaterializationPlan, ProjectAnalysisPreparationOptions, ProjectAnalysisScanOptions } from '../capabilities/project-intelligence/ProjectIntelligenceCapability.js';
import type { ColdStartWorkflowIntent } from './ColdStartIntent.js';
export interface ColdStartWorkflowPlan {
    intent: ColdStartWorkflowIntent;
    cleanup: {
        policy: 'full-reset';
        projectRoot: string;
        dataRoot: string;
    };
    projectAnalysis: {
        projectRoot: string;
        prepare: ProjectAnalysisPreparationOptions;
        scan: ProjectAnalysisScanOptions;
        materialize: ProjectAnalysisMaterializationPlan;
    };
    response: {
        tool: 'alembic_bootstrap';
    };
}
export type ColdStartSelectionSkipReason = 'unknown-requested-dimension' | 'filtered-after-selection';
export interface ColdStartSelectionSummary {
    activeCount: number;
    duplicateCollapsedCount: number;
    duplicateRequestedDimensionIds: string[];
    requestedCount: number;
    requestedDimensionIds: string[];
    requestedUniqueCount: number;
    selectedCount: number;
    selectedDimensionIds: string[];
    skippedRequestedDimensions: Array<{
        id: string;
        reason: ColdStartSelectionSkipReason;
    }>;
    unknownRequestedDimensionIds: string[];
}
export declare function buildColdStartWorkflowPlan({ intent, projectRoot, dataRoot, }: {
    intent: ColdStartWorkflowIntent;
    projectRoot: string;
    dataRoot: string;
}): ColdStartWorkflowPlan;
export declare function selectColdStartDimensions(snapshot: ProjectSnapshot, intent: ColdStartWorkflowIntent): DimensionDef[];
export declare function buildColdStartSelectionSummary({ snapshot, intent, selectedDimensions, }: {
    snapshot: ProjectSnapshot;
    intent: ColdStartWorkflowIntent;
    selectedDimensions: readonly DimensionDef[];
}): ColdStartSelectionSummary;
