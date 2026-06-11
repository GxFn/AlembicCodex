import { type SourceGraphQueryResult, type SourceGraphSnapshot } from '../../domain/source-graph/index.js';
import type { SourceGraphReplaceInput, SourceGraphRepositoryImpl, SourceGraphSymbolSearchOptions } from '../../repository/source-graph/SourceGraphRepository.js';
import { type SourceGraphFreshnessOptions, type SourceGraphFreshnessReport, type SourceGraphIncrementalIndexOptions, type SourceGraphIndexBuildResult, type SourceGraphIndexOptions } from './SourceGraphIndexer.js';
import { type SourceGraphAffectedTestsInput, type SourceGraphExploreInput, type SourceGraphImpactInput, type SourceGraphNodeInput, type SourceGraphRelationInput, type SourceGraphSearchInput, type SourceGraphValidationPlanInput } from './SourceGraphQueryService.js';
export interface SourceGraphQueryOptions extends SourceGraphSymbolSearchOptions {
    includeEdges?: boolean;
}
export declare class SourceGraphService {
    private readonly repository;
    constructor(repository: SourceGraphRepositoryImpl);
    replaceSnapshot(input: SourceGraphReplaceInput): Promise<SourceGraphSnapshot>;
    buildFullIndex(input: SourceGraphIndexOptions): Promise<SourceGraphIndexBuildResult>;
    buildIncrementalIndex(input: SourceGraphIncrementalIndexOptions): Promise<SourceGraphIndexBuildResult>;
    inspectFreshness(input: SourceGraphFreshnessOptions): Promise<SourceGraphFreshnessReport>;
    getFreshness(projectRoot: string, repoId?: string): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphFreshness>;
    searchSourceGraph(input: SourceGraphSearchInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphSearchResult>;
    exploreSourceGraph(input: SourceGraphExploreInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphExploreResult>;
    getSourceGraphNode(input: SourceGraphNodeInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphNodeResult>;
    getSourceGraphCallers(input: SourceGraphRelationInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphCallersResult>;
    getSourceGraphCallees(input: SourceGraphRelationInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphCalleesResult>;
    getSourceGraphImpact(input: SourceGraphImpactInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphImpactResult>;
    getSourceGraphAffectedTests(input: SourceGraphAffectedTestsInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphAffectedTestsResult>;
    getSourceGraphValidationPlan(input: SourceGraphValidationPlanInput): Promise<import("../../domain/source-graph/SourceGraphContracts.js").SourceGraphValidationPlanResult>;
    querySymbols(generationId: string, query: string, options?: SourceGraphQueryOptions): Promise<SourceGraphQueryResult>;
    clearGeneration(generationId: string): Promise<import("../../repository/source-graph/SourceGraphRepository.js").SourceGraphClearResult>;
}
