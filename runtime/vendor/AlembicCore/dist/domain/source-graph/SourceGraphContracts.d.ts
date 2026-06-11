export declare const SOURCE_GRAPH_FRESHNESS_STATES: readonly ["uninitialized", "opening", "catching-up", "fresh", "pending", "stale", "partial", "degraded", "unavailable", "wrong-scope"];
export declare const SOURCE_GRAPH_SNAPSHOT_STATUSES: readonly ["building", "opening", "catching-up", "indexed", "partial", "degraded", "failed", "cleared", "wrong-scope"];
export declare const SOURCE_GRAPH_FILE_CLASSIFICATIONS: readonly ["source", "test", "generated", "config", "documentation", "unknown"];
export declare const SOURCE_GRAPH_PARSE_STATUSES: readonly ["parsed", "partial", "failed", "skipped", "unknown"];
export declare const SOURCE_GRAPH_EDGE_PROVENANCES: readonly ["deterministic", "heuristic"];
export declare const SOURCE_GRAPH_EDGE_KINDS: readonly ["imports", "calls", "data_flow", "owns", "implements", "conforms", "inherits", "extends", "route_to_handler", "symbol_to_test", "references", "depends_on"];
export declare const SOURCE_GRAPH_SYMBOL_KINDS: readonly ["module", "namespace", "class", "interface", "struct", "enum", "function", "method", "property", "field", "variable", "constant", "type", "route", "test", "unknown"];
export declare const SOURCE_GRAPH_REDACTION_STATES: readonly ["none", "redacted", "unavailable"];
export declare const SOURCE_GRAPH_DIAGNOSTIC_CODES: readonly ["ambiguous-project-scope", "worktree-index-mismatch", "catch-up-failed", "pending-file-in-response", "low-confidence-query", "ambiguous-symbol", "unsupported-language", "parser-timeout", "large-file-skipped", "source-ref-unproven", "affected-tests-unknown"];
export declare const SOURCE_GRAPH_OPERATION_KINDS: readonly ["status", "search", "explore", "node", "callers", "callees", "impact", "affected-tests", "validation-plan"];
export declare const SOURCE_GRAPH_VALIDATION_PLAN_BUCKETS: readonly ["mustRun", "recommended", "manualReview", "unknown"];
export declare const SOURCE_GRAPH_VALIDATION_EVIDENCE_KINDS: readonly ["changed-file", "impacted-file", "symbol", "edge", "test-file", "repo-script", "diagnostic"];
export declare const SOURCE_GRAPH_VALIDATION_RECOMMENDATION_KINDS: readonly ["test-file", "repo-command", "guard", "manual-review", "unknown"];
export declare const SOURCE_GRAPH_DETAIL_REF_KINDS: readonly ["source-section", "source-graph-report", "parse-report", "impact-report", "validation-report"];
export type SourceGraphFreshnessState = (typeof SOURCE_GRAPH_FRESHNESS_STATES)[number];
export type SourceGraphSnapshotStatus = (typeof SOURCE_GRAPH_SNAPSHOT_STATUSES)[number];
export type SourceGraphFileClassification = (typeof SOURCE_GRAPH_FILE_CLASSIFICATIONS)[number];
export type SourceGraphParseStatus = (typeof SOURCE_GRAPH_PARSE_STATUSES)[number];
export type SourceGraphEdgeProvenance = (typeof SOURCE_GRAPH_EDGE_PROVENANCES)[number];
export type SourceGraphEdgeKind = (typeof SOURCE_GRAPH_EDGE_KINDS)[number] | (string & {});
export type SourceGraphSymbolKind = (typeof SOURCE_GRAPH_SYMBOL_KINDS)[number] | (string & {});
export type SourceGraphRedactionState = (typeof SOURCE_GRAPH_REDACTION_STATES)[number];
export type SourceGraphDiagnosticCode = (typeof SOURCE_GRAPH_DIAGNOSTIC_CODES)[number];
export type SourceGraphOperationKind = (typeof SOURCE_GRAPH_OPERATION_KINDS)[number];
export type SourceGraphValidationPlanBucket = (typeof SOURCE_GRAPH_VALIDATION_PLAN_BUCKETS)[number];
export type SourceGraphValidationEvidenceKind = (typeof SOURCE_GRAPH_VALIDATION_EVIDENCE_KINDS)[number];
export type SourceGraphValidationRecommendationKind = (typeof SOURCE_GRAPH_VALIDATION_RECOMMENDATION_KINDS)[number];
export type SourceGraphDetailRefKind = (typeof SOURCE_GRAPH_DETAIL_REF_KINDS)[number];
export type SourceGraphDiagnosticOwner = 'core' | 'plugin' | 'core-plugin' | 'controller' | 'test';
export interface SourceGraphDiagnosticPolicy {
    code: SourceGraphDiagnosticCode;
    severity: 'info' | 'warning' | 'error';
    owner: SourceGraphDiagnosticOwner;
    nextAction: string;
    invalidConclusion: string;
    blocksReady: boolean;
}
export declare const SOURCE_GRAPH_DIAGNOSTIC_POLICY: Record<SourceGraphDiagnosticCode, SourceGraphDiagnosticPolicy>;
export interface SourceRange {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
export interface SourceGraphParseError {
    message: string;
    severity?: 'error' | 'warning';
    line?: number;
    column?: number;
    code?: string;
    source?: string;
}
export interface SourceGraphFreshness {
    status: SourceGraphFreshnessState;
    checkedAt: number;
    generationId?: string;
    indexedAt?: number;
    reason?: string;
    nextAction?: string;
    pendingFileCount: number;
    staleFileCount: number;
    degradedReason?: string;
}
export interface SourceGraphSnapshot {
    generationId: string;
    projectRoot: string;
    repoId: string;
    graphRoot: string;
    projectScope?: string;
    extractionVersion: string;
    status: SourceGraphSnapshotStatus;
    startedAt: number;
    completedAt?: number;
    indexedAt?: number;
    freshness: SourceGraphFreshness;
    languageCoverage: string[];
    fileCount: number;
    symbolCount: number;
    edgeCount: number;
    parseErrorCount: number;
    degradedReason?: string;
    metadata: Record<string, unknown>;
}
export interface SourceFileNode {
    generationId: string;
    projectRoot: string;
    repoRelativePath: string;
    language: string;
    contentHash: string;
    sizeBytes: number;
    mtimeMs: number;
    indexedAt: number;
    classification: SourceGraphFileClassification;
    parseStatus: SourceGraphParseStatus;
    parseErrors: SourceGraphParseError[];
    lineCount?: number;
    metadata: Record<string, unknown>;
}
export interface SourceSymbolNode {
    generationId: string;
    symbolId: string;
    displayName: string;
    qualifiedName?: string;
    kind: SourceGraphSymbolKind;
    filePath: string;
    range: SourceRange;
    selectionRange?: SourceRange;
    signature?: string;
    containerSymbolId?: string;
    exported: boolean;
    imported: boolean;
    metadata: Record<string, unknown>;
    provenance: Record<string, unknown>;
}
export interface SourceGraphEdge {
    generationId: string;
    edgeId: string;
    kind: SourceGraphEdgeKind;
    fromSymbolId?: string;
    toSymbolId?: string;
    fromFilePath?: string;
    toFilePath?: string;
    siteFilePath?: string;
    site?: SourceRange;
    provenance: SourceGraphEdgeProvenance;
    confidence: number;
    source?: string;
    metadata: Record<string, unknown>;
}
export interface SourceGraphRedaction {
    state: SourceGraphRedactionState;
    reason?: string;
}
export interface SourceSection {
    filePath: string;
    startLine: number;
    endLine: number;
    text?: string;
    reason: string;
    freshness: SourceGraphFreshness;
    redaction: SourceGraphRedaction;
    symbolIds: string[];
    metadata: Record<string, unknown>;
}
export interface SourceGraphDiagnostic {
    severity: 'info' | 'warning' | 'error';
    code: SourceGraphDiagnosticCode;
    message: string;
    filePath?: string;
    line?: number;
    owner: SourceGraphDiagnosticOwner;
    nextAction: string;
    invalidConclusion: string;
    blocksReady: boolean;
    metadata: Record<string, unknown>;
}
export interface SourceGraphDiagnosticInput extends Omit<Partial<SourceGraphDiagnostic>, 'code' | 'severity' | 'owner' | 'nextAction' | 'invalidConclusion' | 'blocksReady' | 'metadata'> {
    code: SourceGraphDiagnosticCode;
    severity?: 'info' | 'warning' | 'error';
    owner?: SourceGraphDiagnosticOwner;
    nextAction?: string;
    invalidConclusion?: string;
    blocksReady?: boolean;
    metadata?: Record<string, unknown>;
}
export interface SourceGraphDetailRef {
    kind: SourceGraphDetailRefKind;
    ref: string;
    label?: string;
}
export interface SourceGraphDetailRefInput extends Partial<SourceGraphDetailRef> {
    kind: SourceGraphDetailRefKind;
    ref: string;
}
export interface SourceGraphOperationBase {
    operation: SourceGraphOperationKind;
    generationId?: string;
    projectRoot: string;
    repoId?: string;
    freshness: SourceGraphFreshness;
    diagnostics: SourceGraphDiagnostic[];
    ready: boolean;
    nextActions: string[];
    detailRefs: SourceGraphDetailRef[];
}
export interface SourceGraphOperationBaseInput {
    generationId?: string;
    projectRoot: string;
    repoId?: string;
    freshness?: SourceGraphFreshnessInput;
    diagnostics?: SourceGraphDiagnosticInput[];
    detailRefs?: SourceGraphDetailRefInput[];
}
export interface SourceGraphValidationEvidence {
    kind: SourceGraphValidationEvidenceKind;
    ref: string;
    filePath?: string;
    symbolId?: string;
    edgeId?: string;
    command?: string;
    diagnosticCode?: SourceGraphDiagnosticCode;
    reason: string;
    confidence: number;
    metadata: Record<string, unknown>;
}
export interface SourceGraphValidationRecommendation {
    bucket: SourceGraphValidationPlanBucket;
    kind: SourceGraphValidationRecommendationKind;
    label: string;
    command?: string;
    filePath?: string;
    symbolId?: string;
    diagnosticCode?: SourceGraphDiagnosticCode;
    reason: string;
    confidence: number;
    evidence: SourceGraphValidationEvidence[];
    metadata: Record<string, unknown>;
}
export interface SourceGraphStatusResult extends SourceGraphOperationBase {
    operation: 'status';
    snapshot?: SourceGraphSnapshot;
    counts: {
        fileCount: number;
        symbolCount: number;
        edgeCount: number;
        parseErrorCount: number;
    };
}
export interface SourceGraphSearchResult extends SourceGraphOperationBase {
    operation: 'search';
    query: string;
    symbols: SourceSymbolNode[];
    sourceSections: SourceSection[];
    edges: SourceGraphEdge[];
    impactedFiles: string[];
}
export interface SourceGraphExploreResult extends SourceGraphOperationBase {
    operation: 'explore';
    query?: string;
    focus?: string;
    symbols: SourceSymbolNode[];
    sourceSections: SourceSection[];
    edges: SourceGraphEdge[];
}
export interface SourceGraphNodeResult extends SourceGraphOperationBase {
    operation: 'node';
    nodeId: string;
    symbol?: SourceSymbolNode;
    sourceSections: SourceSection[];
    edges: SourceGraphEdge[];
}
export interface SourceGraphCallersResult extends SourceGraphOperationBase {
    operation: 'callers';
    symbolId: string;
    callers: SourceSymbolNode[];
    sourceSections: SourceSection[];
    edges: SourceGraphEdge[];
}
export interface SourceGraphCalleesResult extends SourceGraphOperationBase {
    operation: 'callees';
    symbolId: string;
    callees: SourceSymbolNode[];
    sourceSections: SourceSection[];
    edges: SourceGraphEdge[];
}
export interface SourceGraphImpactResult extends SourceGraphOperationBase {
    operation: 'impact';
    changedFiles: string[];
    impactedFiles: string[];
    edges: SourceGraphEdge[];
    affectedValidations: string[];
}
export interface SourceGraphAffectedTestsResult extends SourceGraphOperationBase {
    operation: 'affected-tests';
    changedFiles: string[];
    testFiles: string[];
    unknownReason?: string;
}
export interface SourceGraphValidationPlanResult extends SourceGraphOperationBase {
    operation: 'validation-plan';
    changedFiles: string[];
    seedSymbols: string[];
    impactedFiles: string[];
    impactedSymbols: SourceSymbolNode[];
    edges: SourceGraphEdge[];
    mustRun: SourceGraphValidationRecommendation[];
    recommended: SourceGraphValidationRecommendation[];
    manualReview: SourceGraphValidationRecommendation[];
    unknown: SourceGraphValidationRecommendation[];
    acceptanceBoundary: string;
}
export interface SourceGraphQueryResult {
    generationId: string;
    projectRoot: string;
    query: string;
    freshness: SourceGraphFreshness;
    sourceSections: SourceSection[];
    symbols: SourceSymbolNode[];
    edges: SourceGraphEdge[];
    impactedFiles: string[];
    diagnostics: SourceGraphDiagnostic[];
    metadata: Record<string, unknown>;
}
export interface SourceGraphFreshnessInput extends Partial<SourceGraphFreshness> {
    status?: SourceGraphFreshnessState;
}
export interface SourceGraphSnapshotInput extends Omit<Partial<SourceGraphSnapshot>, 'generationId' | 'projectRoot' | 'freshness' | 'metadata'> {
    generationId: string;
    projectRoot: string;
    freshness?: SourceGraphFreshnessInput;
    metadata?: Record<string, unknown>;
}
export interface SourceFileNodeInput extends Omit<Partial<SourceFileNode>, 'generationId' | 'projectRoot' | 'repoRelativePath' | 'contentHash' | 'metadata'> {
    generationId: string;
    projectRoot: string;
    repoRelativePath: string;
    contentHash: string;
    metadata?: Record<string, unknown>;
}
export interface SourceSymbolNodeInput extends Omit<Partial<SourceSymbolNode>, 'generationId' | 'symbolId' | 'displayName' | 'kind' | 'filePath' | 'range'> {
    generationId: string;
    symbolId: string;
    displayName: string;
    kind: SourceGraphSymbolKind;
    filePath: string;
    range: SourceRange;
}
export interface SourceGraphEdgeInput extends Omit<Partial<SourceGraphEdge>, 'generationId' | 'edgeId' | 'kind' | 'metadata'> {
    generationId: string;
    edgeId: string;
    kind: SourceGraphEdgeKind;
    metadata?: Record<string, unknown>;
}
export interface SourceSectionInput extends Omit<Partial<SourceSection>, 'filePath' | 'startLine' | 'endLine' | 'freshness' | 'redaction' | 'metadata'> {
    filePath: string;
    startLine: number;
    endLine: number;
    freshness?: SourceGraphFreshnessInput;
    redaction?: Partial<SourceGraphRedaction>;
    metadata?: Record<string, unknown>;
}
export interface SourceGraphValidationEvidenceInput extends Omit<Partial<SourceGraphValidationEvidence>, 'kind' | 'ref' | 'confidence' | 'metadata'> {
    kind: SourceGraphValidationEvidenceKind;
    ref: string;
    confidence?: number;
    metadata?: Record<string, unknown>;
}
export interface SourceGraphValidationRecommendationInput extends Omit<Partial<SourceGraphValidationRecommendation>, 'kind' | 'label' | 'confidence' | 'evidence' | 'metadata'> {
    kind: SourceGraphValidationRecommendationKind;
    label: string;
    confidence?: number;
    evidence?: SourceGraphValidationEvidenceInput[];
    metadata?: Record<string, unknown>;
}
export interface SourceGraphQueryResultInput extends Omit<Partial<SourceGraphQueryResult>, 'generationId' | 'projectRoot' | 'query' | 'freshness' | 'diagnostics' | 'metadata'> {
    generationId: string;
    projectRoot: string;
    query: string;
    freshness?: SourceGraphFreshnessInput;
    diagnostics?: SourceGraphDiagnosticInput[];
    metadata?: Record<string, unknown>;
}
export interface SourceGraphStatusResultInput extends SourceGraphOperationBaseInput {
    snapshot?: SourceGraphSnapshot;
    counts?: Partial<SourceGraphStatusResult['counts']>;
}
export interface SourceGraphSearchResultInput extends SourceGraphOperationBaseInput {
    query: string;
    symbols?: SourceSymbolNode[];
    sourceSections?: SourceSection[];
    edges?: SourceGraphEdge[];
    impactedFiles?: string[];
}
export interface SourceGraphExploreResultInput extends SourceGraphOperationBaseInput {
    query?: string;
    focus?: string;
    symbols?: SourceSymbolNode[];
    sourceSections?: SourceSection[];
    edges?: SourceGraphEdge[];
}
export interface SourceGraphNodeResultInput extends SourceGraphOperationBaseInput {
    nodeId: string;
    symbol?: SourceSymbolNode;
    sourceSections?: SourceSection[];
    edges?: SourceGraphEdge[];
}
export interface SourceGraphCallersResultInput extends SourceGraphOperationBaseInput {
    symbolId: string;
    callers?: SourceSymbolNode[];
    sourceSections?: SourceSection[];
    edges?: SourceGraphEdge[];
}
export interface SourceGraphCalleesResultInput extends SourceGraphOperationBaseInput {
    symbolId: string;
    callees?: SourceSymbolNode[];
    sourceSections?: SourceSection[];
    edges?: SourceGraphEdge[];
}
export interface SourceGraphImpactResultInput extends SourceGraphOperationBaseInput {
    changedFiles?: string[];
    impactedFiles?: string[];
    edges?: SourceGraphEdge[];
    affectedValidations?: string[];
}
export interface SourceGraphAffectedTestsResultInput extends SourceGraphOperationBaseInput {
    changedFiles?: string[];
    testFiles?: string[];
    unknownReason?: string;
}
export interface SourceGraphValidationPlanResultInput extends SourceGraphOperationBaseInput {
    changedFiles?: string[];
    seedSymbols?: string[];
    impactedFiles?: string[];
    impactedSymbols?: SourceSymbolNode[];
    edges?: SourceGraphEdge[];
    mustRun?: SourceGraphValidationRecommendationInput[];
    recommended?: SourceGraphValidationRecommendationInput[];
    manualReview?: SourceGraphValidationRecommendationInput[];
    unknown?: SourceGraphValidationRecommendationInput[];
    acceptanceBoundary?: string;
}
export type SourceGraphOperationResult = SourceGraphStatusResult | SourceGraphSearchResult | SourceGraphExploreResult | SourceGraphNodeResult | SourceGraphCallersResult | SourceGraphCalleesResult | SourceGraphImpactResult | SourceGraphAffectedTestsResult | SourceGraphValidationPlanResult;
export declare function createSourceGraphFreshness(input?: SourceGraphFreshnessInput): SourceGraphFreshness;
export declare function createSourceGraphSnapshot(input: SourceGraphSnapshotInput): SourceGraphSnapshot;
export declare function createSourceFileNode(input: SourceFileNodeInput): SourceFileNode;
export declare function createSourceSymbolNode(input: SourceSymbolNodeInput): SourceSymbolNode;
export declare function createSourceGraphEdge(input: SourceGraphEdgeInput): SourceGraphEdge;
export declare function createSourceSection(input: SourceSectionInput): SourceSection;
export declare function createSourceGraphValidationEvidence(input: SourceGraphValidationEvidenceInput): SourceGraphValidationEvidence;
export declare function createSourceGraphValidationRecommendation(input: SourceGraphValidationRecommendationInput): SourceGraphValidationRecommendation;
export declare function createSourceGraphDiagnostic(input: SourceGraphDiagnosticInput): SourceGraphDiagnostic;
export declare function validateSourceGraphDiagnostic(input: SourceGraphDiagnosticInput): string[];
export declare function isSourceGraphDiagnostic(value: unknown): value is SourceGraphDiagnostic;
export declare function createSourceGraphDetailRef(input: SourceGraphDetailRefInput): SourceGraphDetailRef;
export declare function canSourceGraphClaimReady(freshness: SourceGraphFreshness, diagnostics?: SourceGraphDiagnostic[]): boolean;
export declare function collectSourceGraphNextActions(freshness: SourceGraphFreshness, diagnostics?: SourceGraphDiagnostic[]): string[];
export declare function createSourceGraphStatusResult(input: SourceGraphStatusResultInput): SourceGraphStatusResult;
export declare function createSourceGraphSearchResult(input: SourceGraphSearchResultInput): SourceGraphSearchResult;
export declare function createSourceGraphExploreResult(input: SourceGraphExploreResultInput): SourceGraphExploreResult;
export declare function createSourceGraphNodeResult(input: SourceGraphNodeResultInput): SourceGraphNodeResult;
export declare function createSourceGraphCallersResult(input: SourceGraphCallersResultInput): SourceGraphCallersResult;
export declare function createSourceGraphCalleesResult(input: SourceGraphCalleesResultInput): SourceGraphCalleesResult;
export declare function createSourceGraphImpactResult(input: SourceGraphImpactResultInput): SourceGraphImpactResult;
export declare function createSourceGraphAffectedTestsResult(input: SourceGraphAffectedTestsResultInput): SourceGraphAffectedTestsResult;
export declare function createSourceGraphValidationPlanResult(input: SourceGraphValidationPlanResultInput): SourceGraphValidationPlanResult;
export declare function validateSourceGraphStatusResult(input: SourceGraphStatusResultInput): string[];
export declare function validateSourceGraphSearchResult(input: SourceGraphSearchResultInput): string[];
export declare function validateSourceGraphExploreResult(input: SourceGraphExploreResultInput): string[];
export declare function validateSourceGraphNodeResult(input: SourceGraphNodeResultInput): string[];
export declare function validateSourceGraphCallersResult(input: SourceGraphCallersResultInput): string[];
export declare function validateSourceGraphCalleesResult(input: SourceGraphCalleesResultInput): string[];
export declare function validateSourceGraphImpactResult(input: SourceGraphImpactResultInput): string[];
export declare function validateSourceGraphAffectedTestsResult(input: SourceGraphAffectedTestsResultInput): string[];
export declare function validateSourceGraphValidationPlanResult(input: SourceGraphValidationPlanResultInput): string[];
export declare function createSourceGraphQueryResult(input: SourceGraphQueryResultInput): SourceGraphQueryResult;
export declare function validateSourceGraphSnapshot(input: SourceGraphSnapshotInput): string[];
export declare function validateSourceFileNode(input: SourceFileNodeInput): string[];
export declare function validateSourceSymbolNode(input: SourceSymbolNodeInput): string[];
export declare function validateSourceGraphEdge(input: SourceGraphEdgeInput): string[];
export declare function isSourceGraphSnapshot(value: unknown): value is SourceGraphSnapshot;
export declare function isSourceFileNode(value: unknown): value is SourceFileNode;
export declare function isSourceSymbolNode(value: unknown): value is SourceSymbolNode;
export declare function isSourceGraphEdge(value: unknown): value is SourceGraphEdge;
