import type { ProjectSnapshot } from '../../types/project-snapshot.js';
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
export declare function buildColdStartWorkflowPlan({ intent, projectRoot, dataRoot, }: {
    intent: ColdStartWorkflowIntent;
    projectRoot: string;
    dataRoot: string;
}): ColdStartWorkflowPlan;
export declare function selectColdStartDimensions(snapshot: ProjectSnapshot, intent: ColdStartWorkflowIntent): import("../../types/project-snapshot.js").DimensionDef[];
