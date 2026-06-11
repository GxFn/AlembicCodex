export const SOURCE_GRAPH_FRESHNESS_STATES = [
    'uninitialized',
    'opening',
    'catching-up',
    'fresh',
    'pending',
    'stale',
    'partial',
    'degraded',
    'unavailable',
    'wrong-scope',
];
export const SOURCE_GRAPH_SNAPSHOT_STATUSES = [
    'building',
    'opening',
    'catching-up',
    'indexed',
    'partial',
    'degraded',
    'failed',
    'cleared',
    'wrong-scope',
];
export const SOURCE_GRAPH_FILE_CLASSIFICATIONS = [
    'source',
    'test',
    'generated',
    'config',
    'documentation',
    'unknown',
];
export const SOURCE_GRAPH_PARSE_STATUSES = [
    'parsed',
    'partial',
    'failed',
    'skipped',
    'unknown',
];
export const SOURCE_GRAPH_EDGE_PROVENANCES = ['deterministic', 'heuristic'];
export const SOURCE_GRAPH_EDGE_KINDS = [
    'imports',
    'calls',
    'data_flow',
    'owns',
    'implements',
    'conforms',
    'inherits',
    'extends',
    'route_to_handler',
    'symbol_to_test',
    'references',
    'depends_on',
];
export const SOURCE_GRAPH_SYMBOL_KINDS = [
    'module',
    'namespace',
    'class',
    'interface',
    'struct',
    'enum',
    'function',
    'method',
    'property',
    'field',
    'variable',
    'constant',
    'type',
    'route',
    'test',
    'unknown',
];
export const SOURCE_GRAPH_REDACTION_STATES = ['none', 'redacted', 'unavailable'];
export const SOURCE_GRAPH_DIAGNOSTIC_CODES = [
    'ambiguous-project-scope',
    'worktree-index-mismatch',
    'catch-up-failed',
    'pending-file-in-response',
    'low-confidence-query',
    'ambiguous-symbol',
    'unsupported-language',
    'parser-timeout',
    'large-file-skipped',
    'source-ref-unproven',
    'affected-tests-unknown',
];
export const SOURCE_GRAPH_OPERATION_KINDS = [
    'status',
    'search',
    'explore',
    'node',
    'callers',
    'callees',
    'impact',
    'affected-tests',
    'validation-plan',
];
export const SOURCE_GRAPH_VALIDATION_PLAN_BUCKETS = [
    'mustRun',
    'recommended',
    'manualReview',
    'unknown',
];
export const SOURCE_GRAPH_VALIDATION_EVIDENCE_KINDS = [
    'changed-file',
    'impacted-file',
    'symbol',
    'edge',
    'test-file',
    'repo-script',
    'diagnostic',
];
export const SOURCE_GRAPH_VALIDATION_RECOMMENDATION_KINDS = [
    'test-file',
    'repo-command',
    'guard',
    'manual-review',
    'unknown',
];
export const SOURCE_GRAPH_DETAIL_REF_KINDS = [
    'source-section',
    'source-graph-report',
    'parse-report',
    'impact-report',
    'validation-report',
];
export const SOURCE_GRAPH_DIAGNOSTIC_POLICY = {
    'ambiguous-project-scope': {
        code: 'ambiguous-project-scope',
        severity: 'error',
        owner: 'core-plugin',
        nextAction: 'select_project_scope',
        invalidConclusion: 'source facts belong to the active project scope',
        blocksReady: true,
    },
    'worktree-index-mismatch': {
        code: 'worktree-index-mismatch',
        severity: 'error',
        owner: 'core-plugin',
        nextAction: 'rebuild_source_graph_for_current_worktree',
        invalidConclusion: 'indexed source facts match the current worktree',
        blocksReady: true,
    },
    'catch-up-failed': {
        code: 'catch-up-failed',
        severity: 'error',
        owner: 'plugin',
        nextAction: 'retry_or_report_catch_up_failure',
        invalidConclusion: 'source graph is fresh after file changes',
        blocksReady: true,
    },
    'pending-file-in-response': {
        code: 'pending-file-in-response',
        severity: 'warning',
        owner: 'core',
        nextAction: 'exclude_pending_file_or_mark_response_stale',
        invalidConclusion: 'returned source sections are current',
        blocksReady: true,
    },
    'low-confidence-query': {
        code: 'low-confidence-query',
        severity: 'warning',
        owner: 'core',
        nextAction: 'narrow_query_or_use_exact_symbol',
        invalidConclusion: 'top-ranked result is definitive',
        blocksReady: true,
    },
    'ambiguous-symbol': {
        code: 'ambiguous-symbol',
        severity: 'warning',
        owner: 'core',
        nextAction: 'choose_symbol_candidate_or_add_file_filter',
        invalidConclusion: 'symbol reference is unique',
        blocksReady: true,
    },
    'unsupported-language': {
        code: 'unsupported-language',
        severity: 'warning',
        owner: 'core',
        nextAction: 'fallback_to_file_inventory_or_add_parser',
        invalidConclusion: 'parser-backed symbol graph covers this file',
        blocksReady: true,
    },
    'parser-timeout': {
        code: 'parser-timeout',
        severity: 'warning',
        owner: 'core',
        nextAction: 'retry_with_smaller_scope_or_raise_timeout_budget',
        invalidConclusion: 'parse coverage is complete',
        blocksReady: true,
    },
    'large-file-skipped': {
        code: 'large-file-skipped',
        severity: 'warning',
        owner: 'core',
        nextAction: 'request_targeted_read_or_raise_size_limit',
        invalidConclusion: 'large file facts are indexed',
        blocksReady: true,
    },
    'source-ref-unproven': {
        code: 'source-ref-unproven',
        severity: 'warning',
        owner: 'core',
        nextAction: 'verify_source_ref_before_citing',
        invalidConclusion: 'source ref is proven by source graph evidence',
        blocksReady: true,
    },
    'affected-tests-unknown': {
        code: 'affected-tests-unknown',
        severity: 'info',
        owner: 'test',
        nextAction: 'run_broader_validation_or_add_test_edges',
        invalidConclusion: 'affected tests are known completely',
        blocksReady: true,
    },
};
export function createSourceGraphFreshness(input = {}) {
    const checkedAt = normalizeTimestamp(input.checkedAt, Date.now(), 'freshness.checkedAt');
    const status = requireAllowed(input.status ?? 'uninitialized', SOURCE_GRAPH_FRESHNESS_STATES, 'freshness.status');
    return {
        status,
        checkedAt,
        generationId: optionalNonEmpty(input.generationId, 'freshness.generationId'),
        indexedAt: input.indexedAt === undefined
            ? undefined
            : normalizeTimestamp(input.indexedAt, checkedAt, 'freshness.indexedAt'),
        reason: optionalNonEmpty(input.reason, 'freshness.reason'),
        nextAction: optionalNonEmpty(input.nextAction, 'freshness.nextAction'),
        pendingFileCount: normalizeCount(input.pendingFileCount ?? 0, 'freshness.pendingFileCount'),
        staleFileCount: normalizeCount(input.staleFileCount ?? 0, 'freshness.staleFileCount'),
        degradedReason: optionalNonEmpty(input.degradedReason, 'freshness.degradedReason'),
    };
}
export function createSourceGraphSnapshot(input) {
    const generationId = requireNonEmpty(input.generationId, 'snapshot.generationId');
    const projectRoot = requireNonEmpty(input.projectRoot, 'snapshot.projectRoot');
    const startedAt = normalizeTimestamp(input.startedAt, Date.now(), 'snapshot.startedAt');
    const indexedAt = input.indexedAt === undefined
        ? input.completedAt
        : normalizeTimestamp(input.indexedAt, startedAt, 'snapshot.indexedAt');
    const status = requireAllowed(input.status ?? 'indexed', SOURCE_GRAPH_SNAPSHOT_STATUSES, 'snapshot.status');
    return {
        generationId,
        projectRoot,
        repoId: input.repoId?.trim() || 'default',
        graphRoot: input.graphRoot?.trim() || projectRoot,
        projectScope: optionalNonEmpty(input.projectScope, 'snapshot.projectScope'),
        extractionVersion: input.extractionVersion?.trim() || 'source-graph-v1',
        status,
        startedAt,
        completedAt: input.completedAt === undefined
            ? undefined
            : normalizeTimestamp(input.completedAt, startedAt, 'snapshot.completedAt'),
        indexedAt,
        freshness: createSourceGraphFreshness({
            generationId,
            indexedAt,
            status: status === 'indexed' ? 'fresh' : mapSnapshotStatusToFreshness(status),
            ...input.freshness,
        }),
        languageCoverage: normalizeStringList(input.languageCoverage ?? []),
        fileCount: normalizeCount(input.fileCount ?? 0, 'snapshot.fileCount'),
        symbolCount: normalizeCount(input.symbolCount ?? 0, 'snapshot.symbolCount'),
        edgeCount: normalizeCount(input.edgeCount ?? 0, 'snapshot.edgeCount'),
        parseErrorCount: normalizeCount(input.parseErrorCount ?? 0, 'snapshot.parseErrorCount'),
        degradedReason: optionalNonEmpty(input.degradedReason, 'snapshot.degradedReason'),
        metadata: normalizeRecord(input.metadata),
    };
}
export function createSourceFileNode(input) {
    return {
        generationId: requireNonEmpty(input.generationId, 'file.generationId'),
        projectRoot: requireNonEmpty(input.projectRoot, 'file.projectRoot'),
        repoRelativePath: requireNonEmpty(input.repoRelativePath, 'file.repoRelativePath'),
        language: input.language?.trim() || 'unknown',
        contentHash: requireNonEmpty(input.contentHash, 'file.contentHash'),
        sizeBytes: normalizeCount(input.sizeBytes ?? 0, 'file.sizeBytes'),
        mtimeMs: normalizeTimestamp(input.mtimeMs, 0, 'file.mtimeMs'),
        indexedAt: normalizeTimestamp(input.indexedAt, Date.now(), 'file.indexedAt'),
        classification: requireAllowed(input.classification ?? 'source', SOURCE_GRAPH_FILE_CLASSIFICATIONS, 'file.classification'),
        parseStatus: requireAllowed(input.parseStatus ?? 'parsed', SOURCE_GRAPH_PARSE_STATUSES, 'file.parseStatus'),
        parseErrors: normalizeParseErrors(input.parseErrors ?? []),
        lineCount: input.lineCount === undefined ? undefined : normalizeCount(input.lineCount, 'file.lineCount'),
        metadata: normalizeRecord(input.metadata),
    };
}
export function createSourceSymbolNode(input) {
    return {
        generationId: requireNonEmpty(input.generationId, 'symbol.generationId'),
        symbolId: requireNonEmpty(input.symbolId, 'symbol.symbolId'),
        displayName: requireNonEmpty(input.displayName, 'symbol.displayName'),
        qualifiedName: optionalNonEmpty(input.qualifiedName, 'symbol.qualifiedName'),
        kind: requireNonEmpty(input.kind, 'symbol.kind'),
        filePath: requireNonEmpty(input.filePath, 'symbol.filePath'),
        range: normalizeRange(input.range, 'symbol.range'),
        selectionRange: input.selectionRange === undefined
            ? undefined
            : normalizeRange(input.selectionRange, 'symbol.selectionRange'),
        signature: optionalNonEmpty(input.signature, 'symbol.signature'),
        containerSymbolId: optionalNonEmpty(input.containerSymbolId, 'symbol.containerSymbolId'),
        exported: input.exported ?? false,
        imported: input.imported ?? false,
        metadata: normalizeRecord(input.metadata),
        provenance: normalizeRecord(input.provenance),
    };
}
export function createSourceGraphEdge(input) {
    const edge = {
        generationId: requireNonEmpty(input.generationId, 'edge.generationId'),
        edgeId: requireNonEmpty(input.edgeId, 'edge.edgeId'),
        kind: requireNonEmpty(input.kind, 'edge.kind'),
        fromSymbolId: optionalNonEmpty(input.fromSymbolId, 'edge.fromSymbolId'),
        toSymbolId: optionalNonEmpty(input.toSymbolId, 'edge.toSymbolId'),
        fromFilePath: optionalNonEmpty(input.fromFilePath, 'edge.fromFilePath'),
        toFilePath: optionalNonEmpty(input.toFilePath, 'edge.toFilePath'),
        siteFilePath: optionalNonEmpty(input.siteFilePath, 'edge.siteFilePath'),
        site: input.site === undefined ? undefined : normalizeRange(input.site, 'edge.site'),
        provenance: requireAllowed(input.provenance ?? 'deterministic', SOURCE_GRAPH_EDGE_PROVENANCES, 'edge.provenance'),
        confidence: normalizeConfidence(input.confidence ?? 1, 'edge.confidence'),
        source: optionalNonEmpty(input.source, 'edge.source'),
        metadata: normalizeRecord(input.metadata),
    };
    if (!edge.fromSymbolId && !edge.fromFilePath) {
        throw new Error('edge requires fromSymbolId or fromFilePath.');
    }
    if (!edge.toSymbolId && !edge.toFilePath) {
        throw new Error('edge requires toSymbolId or toFilePath.');
    }
    return edge;
}
export function createSourceSection(input) {
    const startLine = normalizePositiveInteger(input.startLine, 'section.startLine');
    const endLine = normalizePositiveInteger(input.endLine, 'section.endLine');
    if (endLine < startLine) {
        throw new Error('section.endLine must be greater than or equal to section.startLine.');
    }
    return {
        filePath: requireNonEmpty(input.filePath, 'section.filePath'),
        startLine,
        endLine,
        text: input.text,
        reason: input.reason?.trim() || 'source-graph-query',
        freshness: createSourceGraphFreshness(input.freshness),
        redaction: {
            state: requireAllowed(input.redaction?.state ?? 'none', SOURCE_GRAPH_REDACTION_STATES, 'section.redaction.state'),
            reason: optionalNonEmpty(input.redaction?.reason, 'section.redaction.reason'),
        },
        symbolIds: normalizeStringList(input.symbolIds ?? []),
        metadata: normalizeRecord(input.metadata),
    };
}
export function createSourceGraphValidationEvidence(input) {
    return {
        kind: requireAllowed(input.kind, SOURCE_GRAPH_VALIDATION_EVIDENCE_KINDS, 'evidence.kind'),
        ref: requireNonEmpty(input.ref, 'evidence.ref'),
        filePath: optionalNonEmpty(input.filePath, 'evidence.filePath'),
        symbolId: optionalNonEmpty(input.symbolId, 'evidence.symbolId'),
        edgeId: optionalNonEmpty(input.edgeId, 'evidence.edgeId'),
        command: optionalNonEmpty(input.command, 'evidence.command'),
        diagnosticCode: input.diagnosticCode === undefined
            ? undefined
            : requireAllowed(input.diagnosticCode, SOURCE_GRAPH_DIAGNOSTIC_CODES, 'evidence.diagnosticCode'),
        reason: requireNonEmpty(input.reason, 'evidence.reason'),
        confidence: normalizeConfidence(input.confidence ?? 1, 'evidence.confidence'),
        metadata: normalizeRecord(input.metadata),
    };
}
export function createSourceGraphValidationRecommendation(input) {
    return {
        bucket: requireAllowed(input.bucket ?? 'recommended', SOURCE_GRAPH_VALIDATION_PLAN_BUCKETS, 'recommendation.bucket'),
        kind: requireAllowed(input.kind, SOURCE_GRAPH_VALIDATION_RECOMMENDATION_KINDS, 'recommendation.kind'),
        label: requireNonEmpty(input.label, 'recommendation.label'),
        command: optionalNonEmpty(input.command, 'recommendation.command'),
        filePath: optionalNonEmpty(input.filePath, 'recommendation.filePath'),
        symbolId: optionalNonEmpty(input.symbolId, 'recommendation.symbolId'),
        diagnosticCode: input.diagnosticCode === undefined
            ? undefined
            : requireAllowed(input.diagnosticCode, SOURCE_GRAPH_DIAGNOSTIC_CODES, 'recommendation.diagnosticCode'),
        reason: requireNonEmpty(input.reason, 'recommendation.reason'),
        confidence: normalizeConfidence(input.confidence ?? 1, 'recommendation.confidence'),
        evidence: (input.evidence ?? []).map(createSourceGraphValidationEvidence),
        metadata: normalizeRecord(input.metadata),
    };
}
export function createSourceGraphDiagnostic(input) {
    const code = requireAllowed(input.code, SOURCE_GRAPH_DIAGNOSTIC_CODES, 'diagnostic.code');
    const policy = SOURCE_GRAPH_DIAGNOSTIC_POLICY[code];
    return {
        severity: input.severity ?? policy.severity,
        code,
        message: input.message?.trim() || diagnosticMessageFor(code),
        filePath: optionalNonEmpty(input.filePath, 'diagnostic.filePath'),
        line: input.line === undefined
            ? undefined
            : normalizePositiveInteger(input.line, 'diagnostic.line'),
        owner: input.owner ?? policy.owner,
        nextAction: input.nextAction?.trim() || policy.nextAction,
        invalidConclusion: input.invalidConclusion?.trim() || policy.invalidConclusion,
        blocksReady: input.blocksReady ?? policy.blocksReady,
        metadata: normalizeRecord(input.metadata),
    };
}
export function validateSourceGraphDiagnostic(input) {
    return collectValidationIssues(() => createSourceGraphDiagnostic(input));
}
export function isSourceGraphDiagnostic(value) {
    return isValid(() => createSourceGraphDiagnostic(value));
}
export function createSourceGraphDetailRef(input) {
    return {
        kind: requireAllowed(input.kind, SOURCE_GRAPH_DETAIL_REF_KINDS, 'detailRef.kind'),
        ref: requireNonEmpty(input.ref, 'detailRef.ref'),
        label: optionalNonEmpty(input.label, 'detailRef.label'),
    };
}
export function canSourceGraphClaimReady(freshness, diagnostics = []) {
    return freshness.status === 'fresh' && diagnostics.every((diagnostic) => !diagnostic.blocksReady);
}
export function collectSourceGraphNextActions(freshness, diagnostics = []) {
    return normalizeStringList([
        freshness.nextAction,
        ...diagnostics.map((diagnostic) => diagnostic.nextAction),
    ]);
}
export function createSourceGraphStatusResult(input) {
    const base = createSourceGraphOperationBase('status', input);
    return {
        ...base,
        operation: 'status',
        snapshot: input.snapshot,
        counts: {
            fileCount: normalizeCount(input.counts?.fileCount ?? input.snapshot?.fileCount ?? 0, 'statusResult.counts.fileCount'),
            symbolCount: normalizeCount(input.counts?.symbolCount ?? input.snapshot?.symbolCount ?? 0, 'statusResult.counts.symbolCount'),
            edgeCount: normalizeCount(input.counts?.edgeCount ?? input.snapshot?.edgeCount ?? 0, 'statusResult.counts.edgeCount'),
            parseErrorCount: normalizeCount(input.counts?.parseErrorCount ?? input.snapshot?.parseErrorCount ?? 0, 'statusResult.counts.parseErrorCount'),
        },
    };
}
export function createSourceGraphSearchResult(input) {
    const base = createSourceGraphOperationBase('search', input);
    return {
        ...base,
        operation: 'search',
        query: requireNonEmpty(input.query, 'searchResult.query'),
        symbols: input.symbols ?? [],
        sourceSections: input.sourceSections ?? [],
        edges: input.edges ?? [],
        impactedFiles: normalizeStringList(input.impactedFiles ?? []),
    };
}
export function createSourceGraphExploreResult(input) {
    const base = createSourceGraphOperationBase('explore', input);
    return {
        ...base,
        operation: 'explore',
        query: optionalNonEmpty(input.query, 'exploreResult.query'),
        focus: optionalNonEmpty(input.focus, 'exploreResult.focus'),
        symbols: input.symbols ?? [],
        sourceSections: input.sourceSections ?? [],
        edges: input.edges ?? [],
    };
}
export function createSourceGraphNodeResult(input) {
    const base = createSourceGraphOperationBase('node', input);
    return {
        ...base,
        operation: 'node',
        nodeId: requireNonEmpty(input.nodeId, 'nodeResult.nodeId'),
        symbol: input.symbol,
        sourceSections: input.sourceSections ?? [],
        edges: input.edges ?? [],
    };
}
export function createSourceGraphCallersResult(input) {
    const base = createSourceGraphOperationBase('callers', input);
    return {
        ...base,
        operation: 'callers',
        symbolId: requireNonEmpty(input.symbolId, 'callersResult.symbolId'),
        callers: input.callers ?? [],
        sourceSections: input.sourceSections ?? [],
        edges: input.edges ?? [],
    };
}
export function createSourceGraphCalleesResult(input) {
    const base = createSourceGraphOperationBase('callees', input);
    return {
        ...base,
        operation: 'callees',
        symbolId: requireNonEmpty(input.symbolId, 'calleesResult.symbolId'),
        callees: input.callees ?? [],
        sourceSections: input.sourceSections ?? [],
        edges: input.edges ?? [],
    };
}
export function createSourceGraphImpactResult(input) {
    const base = createSourceGraphOperationBase('impact', input);
    return {
        ...base,
        operation: 'impact',
        changedFiles: normalizeStringList(input.changedFiles ?? []),
        impactedFiles: normalizeStringList(input.impactedFiles ?? []),
        edges: input.edges ?? [],
        affectedValidations: normalizeStringList(input.affectedValidations ?? []),
    };
}
export function createSourceGraphAffectedTestsResult(input) {
    const base = createSourceGraphOperationBase('affected-tests', input);
    return {
        ...base,
        operation: 'affected-tests',
        changedFiles: normalizeStringList(input.changedFiles ?? []),
        testFiles: normalizeStringList(input.testFiles ?? []),
        unknownReason: optionalNonEmpty(input.unknownReason, 'affectedTestsResult.unknownReason'),
    };
}
export function createSourceGraphValidationPlanResult(input) {
    const base = createSourceGraphOperationBase('validation-plan', input);
    return {
        ...base,
        operation: 'validation-plan',
        changedFiles: normalizeStringList(input.changedFiles ?? []),
        seedSymbols: normalizeStringList(input.seedSymbols ?? []),
        impactedFiles: normalizeStringList(input.impactedFiles ?? []),
        impactedSymbols: input.impactedSymbols ?? [],
        edges: input.edges ?? [],
        mustRun: normalizeValidationRecommendations(input.mustRun, 'mustRun'),
        recommended: normalizeValidationRecommendations(input.recommended, 'recommended'),
        manualReview: normalizeValidationRecommendations(input.manualReview, 'manualReview'),
        unknown: normalizeValidationRecommendations(input.unknown, 'unknown'),
        acceptanceBoundary: input.acceptanceBoundary?.trim() ||
            'Source graph validation plans are advisory evidence and do not replace controller acceptance, Guard review, or Test-window real-scenario validation.',
    };
}
export function validateSourceGraphStatusResult(input) {
    return collectValidationIssues(() => createSourceGraphStatusResult(input));
}
export function validateSourceGraphSearchResult(input) {
    return collectValidationIssues(() => createSourceGraphSearchResult(input));
}
export function validateSourceGraphExploreResult(input) {
    return collectValidationIssues(() => createSourceGraphExploreResult(input));
}
export function validateSourceGraphNodeResult(input) {
    return collectValidationIssues(() => createSourceGraphNodeResult(input));
}
export function validateSourceGraphCallersResult(input) {
    return collectValidationIssues(() => createSourceGraphCallersResult(input));
}
export function validateSourceGraphCalleesResult(input) {
    return collectValidationIssues(() => createSourceGraphCalleesResult(input));
}
export function validateSourceGraphImpactResult(input) {
    return collectValidationIssues(() => createSourceGraphImpactResult(input));
}
export function validateSourceGraphAffectedTestsResult(input) {
    return collectValidationIssues(() => createSourceGraphAffectedTestsResult(input));
}
export function validateSourceGraphValidationPlanResult(input) {
    return collectValidationIssues(() => createSourceGraphValidationPlanResult(input));
}
export function createSourceGraphQueryResult(input) {
    const diagnostics = (input.diagnostics ?? []).map(createSourceGraphDiagnostic);
    return {
        generationId: requireNonEmpty(input.generationId, 'queryResult.generationId'),
        projectRoot: requireNonEmpty(input.projectRoot, 'queryResult.projectRoot'),
        query: requireNonEmpty(input.query, 'queryResult.query'),
        freshness: createSourceGraphFreshness(input.freshness),
        sourceSections: input.sourceSections ?? [],
        symbols: input.symbols ?? [],
        edges: input.edges ?? [],
        impactedFiles: normalizeStringList(input.impactedFiles ?? []),
        diagnostics,
        metadata: normalizeRecord(input.metadata),
    };
}
export function validateSourceGraphSnapshot(input) {
    return collectValidationIssues(() => createSourceGraphSnapshot(input));
}
export function validateSourceFileNode(input) {
    return collectValidationIssues(() => createSourceFileNode(input));
}
export function validateSourceSymbolNode(input) {
    return collectValidationIssues(() => createSourceSymbolNode(input));
}
export function validateSourceGraphEdge(input) {
    return collectValidationIssues(() => createSourceGraphEdge(input));
}
export function isSourceGraphSnapshot(value) {
    return isValid(() => createSourceGraphSnapshot(value));
}
export function isSourceFileNode(value) {
    return isValid(() => createSourceFileNode(value));
}
export function isSourceSymbolNode(value) {
    return isValid(() => createSourceSymbolNode(value));
}
export function isSourceGraphEdge(value) {
    return isValid(() => createSourceGraphEdge(value));
}
function createSourceGraphOperationBase(operation, input) {
    const freshness = createSourceGraphFreshness(input.freshness);
    const diagnostics = (input.diagnostics ?? []).map(createSourceGraphDiagnostic);
    return {
        operation: requireAllowed(operation, SOURCE_GRAPH_OPERATION_KINDS, 'operation'),
        generationId: optionalNonEmpty(input.generationId, `${operation}.generationId`),
        projectRoot: requireNonEmpty(input.projectRoot, `${operation}.projectRoot`),
        repoId: optionalNonEmpty(input.repoId, `${operation}.repoId`),
        freshness,
        diagnostics,
        ready: canSourceGraphClaimReady(freshness, diagnostics),
        nextActions: collectSourceGraphNextActions(freshness, diagnostics),
        detailRefs: (input.detailRefs ?? []).map(createSourceGraphDetailRef),
    };
}
function normalizeValidationRecommendations(value, bucket) {
    return (value ?? []).map((input) => {
        const recommendation = createSourceGraphValidationRecommendation({
            ...input,
            bucket: input.bucket ?? bucket,
        });
        if (recommendation.bucket !== bucket) {
            throw new Error(`${bucket} recommendation bucket mismatch.`);
        }
        return recommendation;
    });
}
function diagnosticMessageFor(code) {
    return code.replaceAll('-', ' ');
}
function mapSnapshotStatusToFreshness(status) {
    switch (status) {
        case 'building':
        case 'opening':
            return 'opening';
        case 'catching-up':
            return 'catching-up';
        case 'indexed':
            return 'fresh';
        case 'partial':
            return 'partial';
        case 'degraded':
            return 'degraded';
        case 'failed':
            return 'unavailable';
        case 'cleared':
            return 'uninitialized';
        case 'wrong-scope':
            return 'wrong-scope';
    }
}
function requireNonEmpty(value, field) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${field} must be a non-empty string.`);
    }
    return value.trim();
}
function optionalNonEmpty(value, field) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    return requireNonEmpty(value, field);
}
function requireAllowed(value, allowed, field) {
    const normalized = requireNonEmpty(value, field);
    if (!allowed.includes(normalized)) {
        throw new Error(`${field} must be one of: ${allowed.join(', ')}.`);
    }
    return normalized;
}
function normalizeCount(value, field) {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 0) {
        throw new Error(`${field} must be a non-negative integer.`);
    }
    return numberValue;
}
function normalizeTimestamp(value, fallback, field) {
    if (value === undefined || value === null) {
        return fallback;
    }
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue < 0) {
        throw new Error(`${field} must be a non-negative timestamp.`);
    }
    return numberValue;
}
function normalizePositiveInteger(value, field) {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
        throw new Error(`${field} must be a positive integer.`);
    }
    return numberValue;
}
function normalizeConfidence(value, field) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 1) {
        throw new Error(`${field} must be between 0 and 1.`);
    }
    return numberValue;
}
function normalizeRange(range, field) {
    const normalized = {
        startLine: normalizePositiveInteger(range.startLine, `${field}.startLine`),
        startColumn: normalizeCount(range.startColumn, `${field}.startColumn`),
        endLine: normalizePositiveInteger(range.endLine, `${field}.endLine`),
        endColumn: normalizeCount(range.endColumn, `${field}.endColumn`),
    };
    if (normalized.endLine < normalized.startLine ||
        (normalized.endLine === normalized.startLine && normalized.endColumn < normalized.startColumn)) {
        throw new Error(`${field} end must be after start.`);
    }
    return normalized;
}
function normalizeRecord(value) {
    if (value === undefined || value === null) {
        return {};
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('metadata fields must be plain objects.');
    }
    return { ...value };
}
function normalizeStringList(value) {
    return Array.from(new Set(value
        .filter((item) => typeof item === 'string' && item.trim() !== '')
        .map((item) => item.trim())));
}
function normalizeParseErrors(value) {
    return value.map((error) => ({
        message: requireNonEmpty(error.message, 'parseError.message'),
        severity: error.severity ?? 'error',
        line: error.line === undefined
            ? undefined
            : normalizePositiveInteger(error.line, 'parseError.line'),
        column: error.column === undefined ? undefined : normalizeCount(error.column, 'parseError.column'),
        code: optionalNonEmpty(error.code, 'parseError.code'),
        source: optionalNonEmpty(error.source, 'parseError.source'),
    }));
}
function collectValidationIssues(fn) {
    try {
        fn();
        return [];
    }
    catch (error) {
        return [error instanceof Error ? error.message : String(error)];
    }
}
function isValid(fn) {
    return collectValidationIssues(fn).length === 0;
}
