import type { BootstrapFile, IncrementalPlan } from '../../../types/workflows.js';
import type { PhaseReport } from './ProjectIntelligenceRunner.js';
interface ProjectAnalysisIncrementalLogger {
    info(...args: unknown[]): void;
}
interface ProjectAnalysisIncrementalContext {
    container?: unknown;
    db?: unknown;
    logger: ProjectAnalysisIncrementalLogger;
}
export interface ProjectAnalysisIncrementalEvaluationInput {
    enabled: boolean;
    projectRoot: string;
    ctx: ProjectAnalysisIncrementalContext;
    allFiles: BootstrapFile[];
    report: PhaseReport | null;
}
export interface ProjectAnalysisIncrementalEvaluationResult {
    incrementalPlan: IncrementalPlan | null;
    warnings: string[];
}
export declare function evaluateProjectAnalysisIncrementalPlan({ enabled, projectRoot, ctx, allFiles, report, }: ProjectAnalysisIncrementalEvaluationInput): Promise<ProjectAnalysisIncrementalEvaluationResult>;
export {};
