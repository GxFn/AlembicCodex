import { z } from 'zod';
export const SOURCE_GRAPH_OPERATION_TOOL_NAMES = [
    'alembic_source_graph_status',
    'alembic_symbol_search',
    'alembic_code_explore',
    'alembic_source_node',
    'alembic_callers',
    'alembic_callees',
    'alembic_code_impact',
    'alembic_affected_tests',
    'alembic_validation_plan',
];
export const SOURCE_GRAPH_OPERATION_BY_TOOL = {
    alembic_source_graph_status: 'status',
    alembic_symbol_search: 'search',
    alembic_code_explore: 'explore',
    alembic_source_node: 'node',
    alembic_callers: 'callers',
    alembic_callees: 'callees',
    alembic_code_impact: 'impact',
    alembic_affected_tests: 'affected-tests',
    alembic_validation_plan: 'validation-plan',
};
export const SOURCE_GRAPH_TOOL_ALLOWED_BUSINESS_FIELD_NAMES = {
    alembic_source_graph_status: [
        'operation',
        'repo',
        'graph',
        'sync',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'counts',
        'lifecycle',
        'guidance',
        'actions',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_symbol_search: [
        'operation',
        'repo',
        'graph',
        'query',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'symbols',
        'sourceSections',
        'relations',
        'impact',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_code_explore: [
        'operation',
        'repo',
        'graph',
        'query',
        'focus',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'symbols',
        'sourceSections',
        'relations',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_source_node: [
        'operation',
        'repo',
        'graph',
        'nodeId',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'symbol',
        'sourceSections',
        'relations',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_callers: [
        'operation',
        'repo',
        'graph',
        'symbolId',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'callers',
        'sourceSections',
        'relations',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_callees: [
        'operation',
        'repo',
        'graph',
        'symbolId',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'callees',
        'sourceSections',
        'relations',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_code_impact: [
        'operation',
        'repo',
        'graph',
        'changedFiles',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'impactedFiles',
        'relations',
        'impact',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_affected_tests: [
        'operation',
        'repo',
        'graph',
        'changedFiles',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'testFiles',
        'unknownReason',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
    alembic_validation_plan: [
        'operation',
        'repo',
        'graph',
        'sourceGraphRef',
        'sourceEvidenceRefs',
        'changedFiles',
        'seedSymbols',
        'impactedFiles',
        'impactedSymbols',
        'relations',
        'validationPlan',
        'acceptanceBoundary',
        'diagnostics',
        'detailRefs',
        'nextActions',
        'ready',
    ],
};
const SOURCE_GRAPH_FORBIDDEN_OUTPUT_KEYS = new Set([
    'data',
    'globaldatabag',
    'internaltelemetry',
    'legacyaliases',
    'legacycompatibility',
    'metadata',
    'outputbudget',
    'projectruntime',
    'refs',
    'residentsearch',
    'residentservice',
    'result',
    'success',
    'telemetry',
]);
export const SOURCE_GRAPH_TOOL_BUSINESS_SCHEMAS = Object.fromEntries(SOURCE_GRAPH_OPERATION_TOOL_NAMES.map((toolName) => [
    toolName,
    createSourceGraphBusinessSchema(toolName),
]));
export function projectSourceGraphOperationBusiness(input, toolName) {
    const source = unwrapPayload(input);
    const operation = SOURCE_GRAPH_OPERATION_BY_TOOL[toolName];
    const business = {
        operation,
        repo: projectRepo(source),
        graph: projectGraph(source),
        sourceGraphRef: projectSourceGraphRef(source, operation),
        sourceEvidenceRefs: projectSourceEvidenceRefs(source),
        diagnostics: projectDiagnostics(source.diagnostics),
        detailRefs: projectDetailRefs(source.detailRefs),
        nextActions: stringList(source.nextActions),
        ready: source.ready === true,
    };
    switch (toolName) {
        case 'alembic_source_graph_status':
            business.sync = projectSync(source);
            business.counts = projectCounts(source.counts);
            break;
        case 'alembic_symbol_search':
            business.query = stringValue(source.query);
            business.symbols = projectSymbols(source.symbols);
            business.sourceSections = projectSourceSections(source.sourceSections);
            business.relations = projectRelations(source.edges);
            business.impact = compact({ impactedFiles: stringList(source.impactedFiles) });
            break;
        case 'alembic_code_explore':
            business.query = stringValue(source.query);
            business.focus = stringValue(source.focus);
            business.symbols = projectSymbols(source.symbols);
            business.sourceSections = projectSourceSections(source.sourceSections);
            business.relations = projectRelations(source.edges);
            break;
        case 'alembic_source_node':
            business.nodeId = stringValue(source.nodeId);
            business.symbol = projectSymbol(source.symbol);
            business.sourceSections = projectSourceSections(source.sourceSections);
            business.relations = projectRelations(source.edges);
            break;
        case 'alembic_callers':
            business.symbolId = stringValue(source.symbolId);
            business.callers = projectSymbols(source.callers);
            business.sourceSections = projectSourceSections(source.sourceSections);
            business.relations = projectRelations(source.edges);
            break;
        case 'alembic_callees':
            business.symbolId = stringValue(source.symbolId);
            business.callees = projectSymbols(source.callees);
            business.sourceSections = projectSourceSections(source.sourceSections);
            business.relations = projectRelations(source.edges);
            break;
        case 'alembic_code_impact':
            business.changedFiles = stringList(source.changedFiles);
            business.impactedFiles = stringList(source.impactedFiles);
            business.relations = projectRelations(source.edges);
            business.impact = compact({ affectedValidations: stringList(source.affectedValidations) });
            break;
        case 'alembic_affected_tests':
            business.changedFiles = stringList(source.changedFiles);
            business.testFiles = stringList(source.testFiles);
            business.unknownReason = stringValue(source.unknownReason);
            break;
        case 'alembic_validation_plan':
            business.changedFiles = stringList(source.changedFiles);
            business.seedSymbols = stringList(source.seedSymbols);
            business.impactedFiles = stringList(source.impactedFiles);
            business.impactedSymbols = projectSymbols(source.impactedSymbols);
            business.relations = projectRelations(source.edges);
            business.validationPlan = projectValidationPlan(source);
            business.acceptanceBoundary = stringValue(source.acceptanceBoundary);
            break;
    }
    return SOURCE_GRAPH_TOOL_BUSINESS_SCHEMAS[toolName].parse(pickAllowedBusinessFields(compact(business), toolName));
}
export function findForbiddenSourceGraphOutputField(value, path = []) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
            const found = findForbiddenSourceGraphOutputField(item, [...path, String(index)]);
            if (found) {
                return found;
            }
        }
        return null;
    }
    for (const [key, child] of Object.entries(value)) {
        const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (key !== 'detailRefs' && SOURCE_GRAPH_FORBIDDEN_OUTPUT_KEYS.has(normalized)) {
            return { path: [...path, key] };
        }
        const found = findForbiddenSourceGraphOutputField(child, [...path, key]);
        if (found) {
            return found;
        }
    }
    return null;
}
function createSourceGraphBusinessSchema(toolName) {
    const shape = {
        operation: z.literal(SOURCE_GRAPH_OPERATION_BY_TOOL[toolName]),
        ready: z.boolean(),
    };
    for (const fieldName of SOURCE_GRAPH_TOOL_ALLOWED_BUSINESS_FIELD_NAMES[toolName]) {
        if (fieldName !== 'operation' && fieldName !== 'ready') {
            shape[fieldName] = z.unknown().optional();
        }
    }
    return z
        .object(shape)
        .strict()
        .superRefine((output, ctx) => {
        const forbidden = findForbiddenSourceGraphOutputField(output);
        if (forbidden) {
            ctx.addIssue({
                code: 'custom',
                path: forbidden.path,
                message: `Source graph MCP output must not expose ${forbidden.path.join('.')}`,
            });
        }
    });
}
function unwrapPayload(input) {
    if (!isRecord(input)) {
        return {};
    }
    if (isRecord(input.data)) {
        return input.data;
    }
    return input;
}
function projectRepo(source) {
    const snapshot = isRecord(source.snapshot) ? source.snapshot : {};
    return compact({
        id: stringValue(source.repoId) ?? stringValue(snapshot.repoId) ?? 'default',
        scope: stringValue(snapshot.projectScope),
    });
}
function projectGraph(source) {
    const freshness = isRecord(source.freshness) ? source.freshness : {};
    return compact({
        generationId: stringValue(source.generationId) ?? stringValue(freshness.generationId),
        freshness: stringValue(freshness.status) ?? 'unavailable',
        checkedAt: numberValue(freshness.checkedAt),
        indexedAt: numberValue(freshness.indexedAt),
        pendingFileCount: numberValue(freshness.pendingFileCount) ?? 0,
        staleFileCount: numberValue(freshness.staleFileCount) ?? 0,
        reason: stringValue(freshness.reason),
        nextAction: stringValue(freshness.nextAction),
        degradedReason: stringValue(freshness.degradedReason),
    });
}
function projectSync(source) {
    const graph = projectGraph(source);
    return compact({
        status: graph.freshness,
        checkedAt: graph.checkedAt,
        indexedAt: graph.indexedAt,
        pendingFileCount: graph.pendingFileCount,
        staleFileCount: graph.staleFileCount,
        reason: graph.reason,
        nextAction: graph.nextAction,
        degradedReason: graph.degradedReason,
    });
}
function projectCounts(value) {
    const counts = isRecord(value) ? value : {};
    return {
        fileCount: numberValue(counts.fileCount) ?? 0,
        symbolCount: numberValue(counts.symbolCount) ?? 0,
        edgeCount: numberValue(counts.edgeCount) ?? 0,
        parseErrorCount: numberValue(counts.parseErrorCount) ?? 0,
    };
}
function projectDiagnostics(value) {
    return arrayValue(value).map((diagnostic) => compact({
        severity: stringValue(diagnostic.severity),
        code: stringValue(diagnostic.code),
        message: stringValue(diagnostic.message),
        filePath: stringValue(diagnostic.filePath),
        line: numberValue(diagnostic.line),
        owner: stringValue(diagnostic.owner),
        nextAction: stringValue(diagnostic.nextAction),
        invalidConclusion: stringValue(diagnostic.invalidConclusion),
        blocksReady: booleanValue(diagnostic.blocksReady),
    }));
}
function projectDetailRefs(value) {
    return arrayValue(value).map((detailRef) => compact({
        kind: stringValue(detailRef.kind),
        ref: stringValue(detailRef.ref),
        label: stringValue(detailRef.label),
    }));
}
function projectSymbols(value) {
    return arrayValue(value)
        .map(projectSymbol)
        .filter((symbol) => Boolean(symbol));
}
function projectSymbol(value) {
    if (!isRecord(value)) {
        return undefined;
    }
    return compact({
        symbolId: stringValue(value.symbolId),
        displayName: stringValue(value.displayName),
        qualifiedName: stringValue(value.qualifiedName),
        kind: stringValue(value.kind),
        filePath: stringValue(value.filePath),
        range: projectRange(value.range),
        selectionRange: projectRange(value.selectionRange),
        signature: stringValue(value.signature),
        containerSymbolId: stringValue(value.containerSymbolId),
        exported: booleanValue(value.exported),
        imported: booleanValue(value.imported),
    });
}
function projectSourceSections(value) {
    return arrayValue(value).map((section) => {
        const metadata = isRecord(section.metadata) ? section.metadata : {};
        return compact({
            filePath: stringValue(section.filePath),
            startLine: numberValue(section.startLine),
            endLine: numberValue(section.endLine),
            text: stringValue(section.text),
            reason: stringValue(section.reason),
            freshness: isRecord(section.freshness)
                ? (stringValue(section.freshness.status) ?? 'unavailable')
                : undefined,
            redaction: isRecord(section.redaction) ? stringValue(section.redaction.state) : undefined,
            overflow: booleanValue(metadata.overflow),
            originalStartLine: numberValue(metadata.originalStartLine),
            originalEndLine: numberValue(metadata.originalEndLine),
            symbolIds: stringList(section.symbolIds),
        });
    });
}
function projectRelations(value) {
    return arrayValue(value).map((edge) => compact({
        edgeId: stringValue(edge.edgeId),
        kind: stringValue(edge.kind),
        fromSymbolId: stringValue(edge.fromSymbolId),
        toSymbolId: stringValue(edge.toSymbolId),
        fromFilePath: stringValue(edge.fromFilePath),
        toFilePath: stringValue(edge.toFilePath),
        siteFilePath: stringValue(edge.siteFilePath),
        site: projectRange(edge.site),
        provenance: stringValue(edge.provenance),
        confidence: numberValue(edge.confidence),
    }));
}
function projectSourceGraphRef(source, operation) {
    const freshness = isRecord(source.freshness) ? source.freshness : {};
    const generationId = stringValue(source.generationId) ?? stringValue(freshness.generationId) ?? 'unknown';
    const repoId = stringValue(source.repoId) ?? 'default';
    return ['source-graph', operation, repoId, generationId].map(sanitizeRefSegment).join(':');
}
function projectSourceEvidenceRefs(source) {
    return uniqueEvidenceRefs([
        ...projectSymbolEvidenceRefs(source),
        ...projectSectionEvidenceRefs(source),
        ...projectRelationEvidenceRefs(source),
        ...projectFileEvidenceRefs(source),
        ...projectDiagnosticEvidenceRefs(source),
        ...projectValidationEvidenceRefs(source),
    ]).slice(0, 120);
}
function projectSymbolEvidenceRefs(source) {
    const evidenceRefs = [];
    for (const symbol of [
        ...arrayValue(source.symbols),
        ...arrayValue(source.callers),
        ...arrayValue(source.callees),
        ...arrayValue(source.impactedSymbols),
    ]) {
        const ref = stringValue(symbol.symbolId);
        if (ref) {
            evidenceRefs.push(compact({
                kind: 'symbol',
                ref,
                filePath: stringValue(symbol.filePath),
                label: stringValue(symbol.displayName) ?? stringValue(symbol.qualifiedName),
            }));
        }
    }
    const singleSymbol = isRecord(source.symbol) ? source.symbol : null;
    if (singleSymbol) {
        const ref = stringValue(singleSymbol.symbolId);
        if (ref) {
            evidenceRefs.push(compact({
                kind: 'symbol',
                ref,
                filePath: stringValue(singleSymbol.filePath),
                label: stringValue(singleSymbol.displayName) ?? stringValue(singleSymbol.qualifiedName),
            }));
        }
    }
    return evidenceRefs;
}
function projectSectionEvidenceRefs(source) {
    const evidenceRefs = [];
    for (const section of arrayValue(source.sourceSections)) {
        const filePath = stringValue(section.filePath);
        if (filePath) {
            evidenceRefs.push(compact({
                kind: 'source-section',
                ref: [
                    filePath,
                    numberValue(section.startLine) ?? 0,
                    numberValue(section.endLine) ?? 0,
                ].join(':'),
                filePath,
                label: stringValue(section.reason),
            }));
        }
    }
    return evidenceRefs;
}
function projectRelationEvidenceRefs(source) {
    const evidenceRefs = [];
    for (const edge of arrayValue(source.edges)) {
        const ref = stringValue(edge.edgeId);
        if (ref) {
            evidenceRefs.push(compact({
                kind: 'relation',
                ref,
                filePath: stringValue(edge.siteFilePath),
                label: stringValue(edge.kind),
            }));
        }
    }
    return evidenceRefs;
}
function projectFileEvidenceRefs(source) {
    const evidenceRefs = [];
    for (const filePath of [
        ...stringList(source.changedFiles),
        ...stringList(source.impactedFiles),
        ...stringList(source.testFiles),
    ]) {
        evidenceRefs.push({ kind: 'file', ref: filePath, filePath });
    }
    return evidenceRefs;
}
function projectDiagnosticEvidenceRefs(source) {
    const evidenceRefs = [];
    for (const diagnostic of arrayValue(source.diagnostics)) {
        const code = stringValue(diagnostic.code);
        if (code) {
            evidenceRefs.push(compact({
                kind: 'diagnostic',
                ref: code,
                filePath: stringValue(diagnostic.filePath),
                label: stringValue(diagnostic.message),
            }));
        }
    }
    return evidenceRefs;
}
function projectValidationEvidenceRefs(source) {
    const evidenceRefs = [];
    for (const bucketName of ['mustRun', 'recommended', 'manualReview', 'unknown']) {
        for (const recommendation of arrayValue(source[bucketName])) {
            const label = stringValue(recommendation.label);
            if (label) {
                evidenceRefs.push(compact({
                    kind: 'validation-recommendation',
                    ref: `${bucketName}:${sanitizeRefSegment(label)}`,
                    bucket: bucketName,
                    filePath: stringValue(recommendation.filePath),
                    label,
                }));
            }
            for (const evidence of arrayValue(recommendation.evidence)) {
                const ref = stringValue(evidence.ref);
                if (ref) {
                    evidenceRefs.push(compact({
                        kind: 'validation-evidence',
                        ref,
                        bucket: bucketName,
                        filePath: stringValue(evidence.filePath),
                        label: stringValue(evidence.reason),
                    }));
                }
            }
        }
    }
    return evidenceRefs;
}
function projectValidationPlan(source) {
    return {
        manualReview: projectValidationRecommendations(source.manualReview, 'manualReview'),
        mustRun: projectValidationRecommendations(source.mustRun, 'mustRun'),
        recommended: projectValidationRecommendations(source.recommended, 'recommended'),
        unknown: projectValidationRecommendations(source.unknown, 'unknown'),
    };
}
function projectValidationRecommendations(value, bucket) {
    return arrayValue(value).map((recommendation) => {
        const evidenceRefs = arrayValue(recommendation.evidence)
            .map((evidence) => stringValue(evidence.ref))
            .filter((ref) => Boolean(ref));
        return compact({
            bucket,
            kind: stringValue(recommendation.kind),
            label: stringValue(recommendation.label),
            command: stringValue(recommendation.command),
            filePath: stringValue(recommendation.filePath),
            symbolId: stringValue(recommendation.symbolId),
            diagnosticCode: stringValue(recommendation.diagnosticCode),
            reason: stringValue(recommendation.reason),
            confidence: numberValue(recommendation.confidence),
            evidenceRefs,
            evidenceCount: evidenceRefs.length,
        });
    });
}
function projectRange(value) {
    if (!isRecord(value)) {
        return undefined;
    }
    return compact({
        startLine: numberValue(value.startLine),
        startColumn: numberValue(value.startColumn),
        endLine: numberValue(value.endLine),
        endColumn: numberValue(value.endColumn),
    });
}
function pickAllowedBusinessFields(value, toolName) {
    const allowed = new Set(SOURCE_GRAPH_TOOL_ALLOWED_BUSINESS_FIELD_NAMES[toolName]);
    return Object.fromEntries(Object.entries(value).filter(([key]) => allowed.has(key)));
}
function compact(value) {
    return Object.fromEntries(Object.entries(value).filter(([, child]) => child !== undefined));
}
function arrayValue(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter(isRecord);
}
function stringList(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string' && item.length > 0);
}
function stringValue(value) {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
function numberValue(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function booleanValue(value) {
    return typeof value === 'boolean' ? value : undefined;
}
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function sanitizeRefSegment(value) {
    return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}
function uniqueEvidenceRefs(values) {
    const seen = new Set();
    const output = [];
    for (const value of values) {
        const key = [value.kind, value.ref, value.bucket ?? '', value.filePath ?? ''].join('\0');
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        output.push(value);
    }
    return output;
}
