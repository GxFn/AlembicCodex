import { type SourceFileNode, type SourceFileNodeInput, type SourceGraphEdge, type SourceGraphEdgeInput, type SourceGraphFreshness, type SourceGraphSnapshot, type SourceGraphSnapshotInput, type SourceSymbolNode, type SourceSymbolNodeInput } from '../../domain/source-graph/index.js';
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
import { sourceGraphGenerations } from '../../infrastructure/database/drizzle/schema.js';
import { RepositoryBase } from '../base/RepositoryBase.js';
export interface SourceGraphSymbolInsert extends SourceSymbolNodeInput {
    projectRoot?: string;
}
export interface SourceGraphEdgeInsert extends SourceGraphEdgeInput {
    projectRoot?: string;
}
export interface SourceGraphReplaceInput {
    snapshot: SourceGraphSnapshotInput;
    files?: SourceFileNodeInput[];
    symbols?: SourceGraphSymbolInsert[];
    edges?: SourceGraphEdgeInsert[];
}
export interface SourceGraphStats {
    generationId: string;
    fileCount: number;
    symbolCount: number;
    edgeCount: number;
    parseErrorCount: number;
    languageCoverage: string[];
    freshness: SourceGraphFreshness;
}
export interface SourceGraphClearResult {
    generations: number;
    files: number;
    symbols: number;
    edges: number;
}
export interface SourceGraphSymbolSearchOptions {
    limit?: number;
    kind?: string;
    filePath?: string;
}
export interface SourceGraphEdgeQueryOptions {
    limit?: number;
    kind?: string;
    fromSymbolId?: string;
    toSymbolId?: string;
    filePath?: string;
}
export type SourceGraphEdgeDirection = 'incoming' | 'outgoing' | 'both';
export declare class SourceGraphRepositoryImpl extends RepositoryBase<typeof sourceGraphGenerations, SourceGraphSnapshot> {
    constructor(drizzle: DrizzleDB);
    findById(id: string | number): Promise<SourceGraphSnapshot | null>;
    create(data: SourceGraphSnapshotInput): Promise<SourceGraphSnapshot>;
    delete(id: string | number): Promise<boolean>;
    createGeneration(input: SourceGraphSnapshotInput): Promise<SourceGraphSnapshot>;
    completeGeneration(generationId: string, updates?: Partial<SourceGraphSnapshotInput>): Promise<SourceGraphSnapshot>;
    replaceGeneration(input: SourceGraphReplaceInput): Promise<SourceGraphSnapshot>;
    getSnapshot(generationId: string): Promise<SourceGraphSnapshot | null>;
    getLatestSnapshot(projectRoot: string, repoId?: string): Promise<SourceGraphSnapshot | null>;
    getFreshness(projectRoot: string, repoId?: string): Promise<SourceGraphFreshness>;
    upsertFile(input: SourceFileNodeInput, refreshStats?: boolean): Promise<SourceFileNode>;
    upsertSymbol(input: SourceGraphSymbolInsert, refreshStats?: boolean): Promise<SourceSymbolNode>;
    upsertEdge(input: SourceGraphEdgeInsert, refreshStats?: boolean): Promise<SourceGraphEdge>;
    findFile(generationId: string, repoRelativePath: string): Promise<SourceFileNode | null>;
    listFiles(generationId: string): Promise<SourceFileNode[]>;
    getSymbol(generationId: string, symbolId: string): Promise<SourceSymbolNode | null>;
    listSymbols(generationId: string): Promise<SourceSymbolNode[]>;
    searchSymbols(generationId: string, query: string, options?: SourceGraphSymbolSearchOptions): Promise<SourceSymbolNode[]>;
    listEdges(generationId: string, options?: SourceGraphEdgeQueryOptions): Promise<SourceGraphEdge[]>;
    findEdgesForSymbol(generationId: string, symbolId: string, direction?: SourceGraphEdgeDirection): Promise<SourceGraphEdge[]>;
    findEdgesForFile(generationId: string, filePath: string): Promise<SourceGraphEdge[]>;
    getStats(generationId: string): Promise<SourceGraphStats>;
    clearGeneration(generationId: string): Promise<SourceGraphClearResult>;
    private writeGeneration;
    private refreshGenerationStats;
    private resolveProjectRoot;
    private getRequiredSnapshot;
    private getRequiredFile;
    private getRequiredSymbol;
    private getRequiredEdge;
}
