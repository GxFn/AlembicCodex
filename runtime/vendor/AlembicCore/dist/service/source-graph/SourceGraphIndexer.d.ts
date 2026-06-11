import { type SourceFileNode, type SourceGraphDiagnostic, type SourceGraphEdge, type SourceGraphFreshness, type SourceGraphSnapshot, type SourceGraphStatusResult, type SourceSymbolNode } from '../../domain/source-graph/index.js';
import type { SourceGraphRepositoryImpl } from '../../repository/source-graph/SourceGraphRepository.js';
export declare const SOURCE_GRAPH_INDEXER_VERSION = "source-graph-indexer-v1";
export interface SourceGraphIndexOptions {
    projectRoot: string;
    repoId?: string;
    projectScope?: string;
    generationId?: string;
    extractorVersion?: string;
    now?: number;
    includeExtensions?: string[];
    ignoreDirectories?: string[];
    maxFileSizeBytes?: number;
    maxParseBytes?: number;
}
export interface SourceGraphIncrementalIndexOptions extends SourceGraphIndexOptions {
    baseGenerationId?: string;
    changedFiles?: string[];
    deletedFiles?: string[];
}
export interface SourceGraphIndexBuildResult {
    snapshot: SourceGraphSnapshot;
    status: SourceGraphStatusResult;
    diagnostics: SourceGraphDiagnostic[];
    changedFiles: string[];
    deletedFiles: string[];
    files: SourceFileNode[];
    symbols: SourceSymbolNode[];
    edges: SourceGraphEdge[];
}
export interface SourceGraphFreshnessOptions extends SourceGraphIndexOptions {
    generationId?: string;
}
export interface SourceGraphFreshnessReport {
    snapshot?: SourceGraphSnapshot;
    freshness: SourceGraphFreshness;
    status: SourceGraphStatusResult;
    diagnostics: SourceGraphDiagnostic[];
    changedFiles: string[];
    deletedFiles: string[];
}
export declare class SourceGraphIndexer {
    private readonly repository;
    constructor(repository: SourceGraphRepositoryImpl);
    buildFull(input: SourceGraphIndexOptions): Promise<SourceGraphIndexBuildResult>;
    buildIncremental(input: SourceGraphIncrementalIndexOptions): Promise<SourceGraphIndexBuildResult>;
    private buildGeneration;
}
export declare class SourceGraphFreshnessService {
    private readonly repository;
    constructor(repository: SourceGraphRepositoryImpl);
    inspect(input: SourceGraphFreshnessOptions): Promise<SourceGraphFreshnessReport>;
}
