import { type ProjectAnalysisMaterializationInput, type ProjectAnalysisMaterializationOptions, runAllPhases } from './ProjectIntelligenceRunner.js';
export type ProjectAnalysisContext = Parameters<typeof runAllPhases>[1];
export type ProjectAnalysisOptions = Parameters<typeof runAllPhases>[2];
export type ProjectAnalysisResult = Awaited<ReturnType<typeof runAllPhases>>;
export type ProjectAnalysisPreparationOptions = Pick<NonNullable<ProjectAnalysisOptions>, 'clearOldData' | 'dataRoot'>;
export type ProjectAnalysisScanOptions = Omit<NonNullable<ProjectAnalysisOptions>, 'materialize' | 'clearOldData' | 'dataRoot'>;
export type ProjectAnalysisMaterializationPlan = ProjectAnalysisMaterializationInput;
export type ProjectAnalysisMaterialization = ProjectAnalysisMaterializationOptions;
export interface ProjectIntelligenceCapabilityRunInput {
    projectRoot: string;
    ctx: ProjectAnalysisContext;
    prepare?: ProjectAnalysisPreparationOptions;
    scan?: ProjectAnalysisScanOptions;
    materialize?: ProjectAnalysisMaterializationPlan;
}
export interface ProjectIntelligenceCapabilityFacade {
    run(input: ProjectIntelligenceCapabilityRunInput): Promise<ProjectAnalysisResult>;
}
export declare const ProjectIntelligenceCapability: ProjectIntelligenceCapabilityFacade;
export type ProjectAnalysisCapabilityRunInput = ProjectIntelligenceCapabilityRunInput;
export type ProjectAnalysisCapabilityFacade = ProjectIntelligenceCapabilityFacade;
export declare const ProjectAnalysisCapability: ProjectIntelligenceCapabilityFacade;
export declare function collectProjectAnalysis(projectRoot: string, ctx: ProjectAnalysisContext, options?: ProjectAnalysisOptions): Promise<ProjectAnalysisResult>;
