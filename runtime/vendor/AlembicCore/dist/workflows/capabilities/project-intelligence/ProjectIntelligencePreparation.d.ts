interface ProjectAnalysisPreparationLogger {
    info(...args: unknown[]): void;
}
interface ProjectAnalysisPreparationContext {
    logger: ProjectAnalysisPreparationLogger;
}
interface ProjectAnalysisPreparationOptions {
    clearOldData?: boolean;
    dataRoot?: string;
}
export interface ProjectAnalysisRunPreparationInput {
    projectRoot: string;
    ctx: ProjectAnalysisPreparationContext;
    options: ProjectAnalysisPreparationOptions;
}
export interface ProjectAnalysisRunPreparationResult {
    warnings: string[];
}
export declare function prepareProjectAnalysisRun({ projectRoot, ctx, options, }: ProjectAnalysisRunPreparationInput): Promise<ProjectAnalysisRunPreparationResult>;
export {};
