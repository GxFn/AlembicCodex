import type { DimensionDef } from '../../types/project-snapshot.js';
import type { ProjectAnalysisMaterializationPlan, ProjectAnalysisPreparationOptions, ProjectAnalysisScanOptions } from '../capabilities/project-intelligence/ProjectIntelligenceCapability.js';
import type { KnowledgeRescanWorkflowIntent } from './KnowledgeRescanIntent.js';
export interface KnowledgeRescanWorkflowPlan {
    intent: KnowledgeRescanWorkflowIntent;
    cleanup: {
        policy: 'none' | 'force-rescan' | 'rescan-clean';
        projectRoot: string;
    };
    projectAnalysis: {
        projectRoot: string;
        prepare: ProjectAnalysisPreparationOptions;
        scan: ProjectAnalysisScanOptions;
        materialize: ProjectAnalysisMaterializationPlan;
    };
    response: {
        tool: 'alembic_rescan';
    };
}
export declare function buildKnowledgeRescanWorkflowPlan({ intent, projectRoot, dataRoot, }: {
    intent: KnowledgeRescanWorkflowIntent;
    projectRoot: string;
    dataRoot: string;
}): KnowledgeRescanWorkflowPlan;
export declare function selectKnowledgeRescanDimensions(dimensions: readonly DimensionDef[], intent: KnowledgeRescanWorkflowIntent): DimensionDef[];
