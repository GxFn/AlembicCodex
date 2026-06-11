import { type SourceGraphAffectedTestsResult, type SourceGraphCalleesResult, type SourceGraphCallersResult, type SourceGraphExploreResult, type SourceGraphImpactResult, type SourceGraphNodeResult, type SourceGraphSearchResult, type SourceGraphValidationPlanResult } from '../../domain/source-graph/index.js';
import type { SourceGraphRepositoryImpl } from '../../repository/source-graph/SourceGraphRepository.js';
export interface SourceGraphQueryTarget {
    generationId?: string;
    projectRoot?: string;
    repoId?: string;
}
export interface SourceGraphRankingOptions extends SourceGraphQueryTarget {
    limit?: number;
    kind?: string;
    filePath?: string;
    includeEdges?: boolean;
    includeText?: boolean;
    includeTests?: boolean;
    includeGenerated?: boolean;
    includeConfig?: boolean;
    contextLines?: number;
    maxSectionLines?: number;
    sourceSectionLineBudget?: number;
    edgeLimit?: number;
}
export interface SourceGraphSearchInput extends SourceGraphRankingOptions {
    query: string;
}
export interface SourceGraphExploreInput extends SourceGraphRankingOptions {
    query?: string;
    focus?: string;
}
export interface SourceGraphNodeInput extends SourceGraphRankingOptions {
    nodeId: string;
}
export interface SourceGraphRelationInput extends SourceGraphRankingOptions {
    symbolId: string;
}
export interface SourceGraphImpactInput extends SourceGraphRankingOptions {
    changedFiles?: string[];
    symbolId?: string;
}
export interface SourceGraphAffectedTestsInput extends SourceGraphRankingOptions {
    changedFiles: string[];
}
export interface SourceGraphValidationPlanInput extends SourceGraphRankingOptions {
    changedFiles?: string[];
    symbolIds?: string[];
    packageScripts?: Record<string, string>;
}
export declare class SourceGraphQueryService {
    private readonly repository;
    constructor(repository: SourceGraphRepositoryImpl);
    search(input: SourceGraphSearchInput): Promise<SourceGraphSearchResult>;
    explore(input: SourceGraphExploreInput): Promise<SourceGraphExploreResult>;
    node(input: SourceGraphNodeInput): Promise<SourceGraphNodeResult>;
    callers(input: SourceGraphRelationInput): Promise<SourceGraphCallersResult>;
    callees(input: SourceGraphRelationInput): Promise<SourceGraphCalleesResult>;
    impact(input: SourceGraphImpactInput): Promise<SourceGraphImpactResult>;
    affectedTests(input: SourceGraphAffectedTestsInput): Promise<SourceGraphAffectedTestsResult>;
    validationPlan(input: SourceGraphValidationPlanInput): Promise<SourceGraphValidationPlanResult>;
    private createContext;
    private resolveSnapshot;
    private rankSymbols;
    private symbolMatchesOptions;
    private buildRankingDiagnostics;
    private buildRankedSymbolSections;
    private createSymbolSectionPlan;
    private buildRelationSections;
    private buildTextRecallSections;
    private buildSectionsFromPlans;
    private collectRelationSymbols;
    private resolveImpactSeedFiles;
    private resolveValidationSeedFiles;
}
