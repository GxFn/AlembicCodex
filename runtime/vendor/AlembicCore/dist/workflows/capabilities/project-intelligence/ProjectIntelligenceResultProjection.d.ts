type ProjectAnalysisTargetItem = string | {
    name: string;
    type?: string;
    packageName?: string;
    path?: unknown;
};
interface ProjectAnalysisTargetFile {
    targetName: string;
    relativePath: string;
}
export interface ProjectAnalysisTargetSummary {
    name: string;
    type: string;
    packageName?: string;
    inferredRole: string;
    fileCount: number;
    isLocalPackage?: true;
}
export interface ProjectAnalysisLocalPackageModule {
    name: string;
    packageName: string;
    fileCount: number;
    inferredRole: string;
    keyFiles: string[];
}
export declare function buildProjectAnalysisTargetsSummary({ allTargets, allFiles, projectRoot, }: {
    allTargets: ProjectAnalysisTargetItem[];
    allFiles: ProjectAnalysisTargetFile[];
    projectRoot: string;
}): ProjectAnalysisTargetSummary[];
export declare function buildProjectAnalysisLocalPackageModules({ targetsSummary, allFiles, }: {
    targetsSummary: ProjectAnalysisTargetSummary[];
    allFiles: ProjectAnalysisTargetFile[];
}): ProjectAnalysisLocalPackageModule[];
export {};
