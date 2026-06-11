import { createSourceGraphFreshness, createSourceGraphQueryResult, } from '../../domain/source-graph/index.js';
import { SourceGraphFreshnessService, SourceGraphIndexer, } from './SourceGraphIndexer.js';
import { SourceGraphQueryService, } from './SourceGraphQueryService.js';
export class SourceGraphService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async replaceSnapshot(input) {
        return this.repository.replaceGeneration(input);
    }
    async buildFullIndex(input) {
        return new SourceGraphIndexer(this.repository).buildFull(input);
    }
    async buildIncrementalIndex(input) {
        return new SourceGraphIndexer(this.repository).buildIncremental(input);
    }
    async inspectFreshness(input) {
        return new SourceGraphFreshnessService(this.repository).inspect(input);
    }
    async getFreshness(projectRoot, repoId = 'default') {
        return this.repository.getFreshness(projectRoot, repoId);
    }
    async searchSourceGraph(input) {
        return new SourceGraphQueryService(this.repository).search(input);
    }
    async exploreSourceGraph(input) {
        return new SourceGraphQueryService(this.repository).explore(input);
    }
    async getSourceGraphNode(input) {
        return new SourceGraphQueryService(this.repository).node(input);
    }
    async getSourceGraphCallers(input) {
        return new SourceGraphQueryService(this.repository).callers(input);
    }
    async getSourceGraphCallees(input) {
        return new SourceGraphQueryService(this.repository).callees(input);
    }
    async getSourceGraphImpact(input) {
        return new SourceGraphQueryService(this.repository).impact(input);
    }
    async getSourceGraphAffectedTests(input) {
        return new SourceGraphQueryService(this.repository).affectedTests(input);
    }
    async getSourceGraphValidationPlan(input) {
        return new SourceGraphQueryService(this.repository).validationPlan(input);
    }
    async querySymbols(generationId, query, options = {}) {
        const snapshot = await this.repository.getSnapshot(generationId);
        if (!snapshot) {
            return createSourceGraphQueryResult({
                generationId,
                projectRoot: 'unknown',
                query,
                freshness: createSourceGraphFreshness({
                    status: 'unavailable',
                    generationId,
                    reason: 'Source graph generation does not exist.',
                    nextAction: 'rebuild_source_graph',
                }),
                diagnostics: [
                    {
                        code: 'source-ref-unproven',
                        message: `Source graph generation not found: ${generationId}`,
                        nextAction: 'rebuild_source_graph',
                    },
                ],
            });
        }
        const searchResult = await this.searchSourceGraph({
            generationId,
            query,
            limit: options.limit,
            kind: options.kind,
            filePath: options.filePath,
            includeEdges: options.includeEdges,
        });
        const diagnostics = buildQueryDiagnostics(query, searchResult.symbols, snapshot);
        return createSourceGraphQueryResult({
            generationId,
            projectRoot: snapshot.projectRoot,
            query,
            freshness: snapshot.freshness,
            symbols: searchResult.symbols,
            edges: searchResult.edges,
            sourceSections: searchResult.sourceSections,
            impactedFiles: searchResult.impactedFiles,
            diagnostics,
            metadata: {
                repoId: snapshot.repoId,
                extractionVersion: snapshot.extractionVersion,
            },
        });
    }
    async clearGeneration(generationId) {
        return this.repository.clearGeneration(generationId);
    }
}
function buildQueryDiagnostics(query, symbols, snapshot) {
    const diagnostics = [];
    if (snapshot.status === 'partial' || snapshot.status === 'degraded') {
        diagnostics.push({
            code: 'catch-up-failed',
            message: `Source graph generation is ${snapshot.status}.`,
            metadata: { degradedReason: snapshot.degradedReason },
        });
    }
    if (symbols.length === 0) {
        diagnostics.push({
            code: 'low-confidence-query',
            message: `No source symbols matched query: ${query}`,
        });
    }
    return diagnostics;
}
