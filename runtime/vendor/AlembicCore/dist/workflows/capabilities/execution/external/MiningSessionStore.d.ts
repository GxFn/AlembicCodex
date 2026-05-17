export interface Finding {
    finding: string;
    evidence?: string;
    importance: number;
    dimId?: string;
    timestamp?: number;
}
export interface CandidateSummary {
    dimId: string;
    title: string;
    subTopic: string;
    summary: string;
}
export interface CrossReference {
    from: string;
    to: string;
    relation: string;
    detail: string;
}
export interface TierReflection {
    tierIndex: number;
    completedDimensions: string[];
    topFindings: Finding[];
    crossDimensionPatterns: string[];
    suggestionsForNextTier: string[];
}
export interface WorkingMemoryDistilled {
    keyFindings?: Finding[];
    toolCallSummary?: Array<string | {
        tool: string;
        summary: string;
    }>;
    stats?: Record<string, number>;
    plan?: Record<string, unknown> | null;
    totalObservations?: number;
    compressedCount?: number;
}
export interface DimensionDigest {
    summary?: string;
    candidateCount?: number;
    keyFindings?: Array<string | Finding>;
    crossRefs?: Record<string, string>;
    gaps?: string[];
    [key: string]: unknown;
}
export interface DimensionReport {
    dimId: string;
    completedAt: number;
    analysisText: string;
    findings: Finding[];
    referencedFiles: string[];
    candidatesSummary: CandidateSummary[];
    workingMemoryDistilled: WorkingMemoryDistilled | null;
    digest: DimensionDigest | null;
}
export interface DimensionReportInput {
    analysisText?: string;
    findings?: Array<{
        finding?: string;
        evidence?: string | string[] | unknown;
        importance?: number;
    }>;
    referencedFiles?: string[];
    candidatesSummary?: CandidateSummary[];
    workingMemoryDistilled?: WorkingMemoryDistilled | null;
    digest?: DimensionDigest | null;
}
export interface MiningSessionStoreConfig {
    projectContext?: Record<string, unknown>;
    ttlMs?: number;
    projectName?: string;
    primaryLang?: string;
    fileCount?: number;
    modules?: string[] | number;
    [key: string]: unknown;
}
interface ToolArgs {
    action?: string;
    pattern?: string;
    filePath?: string;
    [key: string]: unknown;
}
export interface MiningSessionStoreSerialized {
    dimensionReports: Record<string, DimensionReport>;
    crossReferences: CrossReference[];
    tierReflections: TierReflection[];
    submittedCandidates: Record<string, CandidateSummary[]>;
    projectContext: Record<string, unknown>;
}
/**
 * Core 版 SessionStore。
 *
 * 它保留 host-agent 挖掘链路需要的维度报告、证据、跨维度上下文、
 * 候选摘要、checkpoint 和只读缓存语义；不依赖 Alembic internal agent、
 * MemoryCoordinator、TimerRegistry 或工具执行器。
 */
export declare class MiningSessionStore {
    #private;
    constructor(config?: MiningSessionStoreConfig);
    storeDimensionReport(dimId: string, report: DimensionReportInput): void;
    getDimensionReport(dimId: string): DimensionReport | undefined;
    getCompletedDimensions(): string[];
    addEvidence(filePath: string, evidence: Omit<Finding, 'timestamp'>): void;
    getEvidenceForFile(filePath: string): Finding[];
    searchEvidence(query: string, dimId?: string): Array<{
        filePath: string;
        evidence: Finding;
    }>;
    addSubmittedCandidate(dimId: string, candidate: Omit<CandidateSummary, 'dimId'>): void;
    addDimensionDigest(dimId: string, digest: DimensionDigest): void;
    addTierReflection(tierIndex: number, reflection: TierReflection): void;
    getTierReflections(): TierReflection[];
    getRelevantReflections(_currentDimId: string): string | null;
    buildContextForDimension(currentDimId: string, focusKeywordsOrOpts?: string[] | {
        focusKeywords?: string[];
        tokenBudget?: number;
    }): string;
    buildContextSnapshot(currentDimId: string): {
        previousDimensions: Record<string, DimensionDigest>;
        submittedCandidates: CandidateSummary[];
    };
    getDistilledForProducer(dimId: string): {
        keyFindings: Finding[];
        toolCallSummary: Array<string | {
            tool: string;
            summary: string;
        }>;
        referencedFiles: string[];
    } | null;
    getCachedResult(toolName: string, args: ToolArgs): unknown | null;
    cacheToolResult(toolName: string, args: ToolArgs, result: unknown): void;
    get(toolName: string, args: ToolArgs): unknown | null;
    set(toolName: string, args: ToolArgs, result: unknown): void;
    saveCheckpoint(projectRoot: string): Promise<void>;
    loadCheckpoint(projectRoot: string, ttlMs?: number): Promise<boolean>;
    toJSON(): MiningSessionStoreSerialized;
    static fromJSON(json: Record<string, unknown>): MiningSessionStore;
    getAllReferencedFiles(): Set<string>;
    getStats(): Record<string, unknown>;
    clearCache(): void;
    dispose(): void;
}
export { MiningSessionStore as SessionStore };
export default MiningSessionStore;
