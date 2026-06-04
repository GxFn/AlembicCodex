/**
 * HostIntentFrame — Codex host intent intake boundary.
 *
 * 这里是 Plugin-owned 的宿主意图承载层，只做输入归一化、敏感字段脱敏和
 * IntentExtractor 结果合并；不下沉到 Core，也不创建持久化 IntentEpisode。
 */
import { createHash } from 'node:crypto';
export function prepareHostIntentInput(input) {
    const degradedReasons = [];
    const userQuery = normalizeString(input.userQuery, 1200);
    const activeFile = normalizeString(input.activeFile, 1200);
    const language = normalizeString(input.language, 80);
    const declaredResult = normalizeHostDeclaredIntent(input.hostDeclaredIntent);
    const explicitTurnMeta = normalizeHostTurnMeta(input.hostTurnMeta);
    const requestTurnMeta = normalizeHostTurnMeta(input.requestHostTurnMeta);
    degradedReasons.push(...declaredResult.degradedReasons);
    degradedReasons.push(...explicitTurnMeta.degradedReasons);
    degradedReasons.push(...requestTurnMeta.degradedReasons);
    const hostDeclaredIntent = declaredResult.value;
    const hostTurnMeta = mergeHostTurnMeta(requestTurnMeta.value, explicitTurnMeta.value);
    const declaredQuery = firstDefinedString(hostDeclaredIntent?.query, hostDeclaredIntent?.summary, hostDeclaredIntent?.goal, hostDeclaredIntent?.action);
    const rawAutomationEnvelope = looksLikeAutomationEnvelopeText(userQuery);
    if (rawAutomationEnvelope && !declaredQuery) {
        degradedReasons.push('hostIntent.rawAutomationEnvelopeWithoutDeclaredIntent');
    }
    const effectiveUserQuery = declaredQuery ?? (rawAutomationEnvelope ? undefined : userQuery) ?? '';
    const effectiveLanguage = language ?? hostDeclaredIntent?.language ?? hostTurnMeta?.language;
    const source = resolveSource(Boolean(userQuery), Boolean(declaredQuery || hostDeclaredIntent));
    return {
        userQuery: effectiveUserQuery,
        ...(activeFile ? { activeFile } : {}),
        ...(effectiveLanguage ? { language: effectiveLanguage } : {}),
        ...(hostDeclaredIntent ? { hostDeclaredIntent } : {}),
        ...(hostTurnMeta ? { hostTurnMeta } : {}),
        source,
        degraded: degradedReasons.length > 0,
        degradedReasons,
    };
}
export function buildResidentIntentHandoff(input) {
    const frame = input.hostIntentFrame;
    const explicitSourceRefs = normalizeSourceRefs(input.sourceRefs);
    const sessionHistory = normalizeSessionHistory(input.sessionHistory);
    if (!frame || !hasResidentIntentSignal(frame, explicitSourceRefs)) {
        return null;
    }
    const declared = normalizeResidentDeclaredIntent(frame.hostDeclaredIntent);
    const sourceRefs = uniqueStrings([
        ...normalizeSourceRefs(declared?.sourceRefs),
        ...explicitSourceRefs,
    ]);
    const recognizedIntentDraft = frame.recognizedIntentDraft
        ? summarizeRecognizedIntentDraft(frame.recognizedIntentDraft, {
            sourceRefs,
        })
        : undefined;
    const query = firstDefinedString(declared?.query, declared?.summary, declared?.goal, declared?.action, input.userQuery);
    const queryHints = normalizeQueryHints(frame.extracted.queries);
    const keywords = uniqueStrings([
        ...(declared?.keywords ?? []),
        ...(declared?.labels ?? []),
        frame.extracted.module ?? '',
    ]).filter(Boolean);
    const language = declared?.language ?? frame.hostTurnMeta?.language ?? input.language ?? null;
    const scenario = declared?.scenario ?? frame.extracted.scenario;
    const degradedReason = frame.degradedReasons.join('; ') || undefined;
    const sources = uniqueStrings([
        frame.source,
        ...(declared ? ['hostDeclaredIntent'] : []),
        ...(frame.hostTurnMeta ? ['hostTurnMeta'] : []),
    ]);
    const intentContext = {
        applied: true,
        confidence: frame.confidence,
        degraded: frame.degraded,
        queries: queryHints,
        queryHints,
        searchIntent: scenario,
        scenario,
        sources,
    };
    if (recognizedIntentDraft) {
        intentContext.recognizedIntentDraft = recognizedIntentDraft;
    }
    if (query) {
        intentContext.query = query;
    }
    if (keywords.length > 0) {
        intentContext.keywords = keywords.slice(0, 12);
    }
    if (language) {
        intentContext.language = language;
    }
    if (degradedReason) {
        intentContext.degradedReason = degradedReason;
    }
    if (sourceRefs.length > 0) {
        intentContext.sourceRefs = sourceRefs;
    }
    return {
        confidence: frame.confidence,
        degraded: frame.degraded,
        ...(degradedReason ? { degradedReason } : {}),
        ...(declared ? { hostDeclaredIntent: declared } : {}),
        ...(frame.hostTurnMeta ? { hostTurnMeta: frame.hostTurnMeta } : {}),
        intentContext,
        ...(language ? { language } : {}),
        scenario,
        searchIntent: scenario,
        ...(sessionHistory.length > 0 ? { sessionHistory } : {}),
        ...(sourceRefs.length > 0 ? { sourceRefs } : {}),
    };
}
export function buildHostIntentFrame(input, extracted) {
    const confidence = resolveConfidence(input);
    const draft = buildRecognizedIntentDraft(input, extracted, confidence);
    const degradedReasons = uniqueStrings([...input.degradedReasons, ...draft.degradedReasons]);
    return {
        source: input.source,
        confidence,
        degraded: input.degraded || draft.degraded,
        degradedReasons,
        ...(input.hostDeclaredIntent ? { hostDeclaredIntent: input.hostDeclaredIntent } : {}),
        ...(input.hostTurnMeta ? { hostTurnMeta: input.hostTurnMeta } : {}),
        recognizedIntentDraft: draft,
        extracted: {
            scenario: extracted.scenario,
            language: extracted.language,
            module: extracted.module,
            queries: extracted.queries,
        },
    };
}
export function readHostTurnMetaFromMcpRequest(request) {
    const requestRecord = asRecord(request);
    const params = asRecord(requestRecord?.params);
    const meta = asRecord(params?._meta) ??
        asRecord(requestRecord?._meta) ??
        asRecord(params?.meta) ??
        asRecord(requestRecord?.meta);
    if (!meta) {
        return undefined;
    }
    const hostTurnMeta = {};
    copyFirstString(hostTurnMeta, 'threadId', meta, ['threadId', 'thread_id', 'codexThreadId']);
    copyFirstString(hostTurnMeta, 'conversationId', meta, ['conversationId', 'conversation_id']);
    copyFirstString(hostTurnMeta, 'sessionId', meta, ['sessionId', 'session_id']);
    copyFirstString(hostTurnMeta, 'turnId', meta, ['turnId', 'turn_id']);
    copyFirstString(hostTurnMeta, 'messageId', meta, ['messageId', 'message_id']);
    copyFirstString(hostTurnMeta, 'source', meta, ['source', 'hostSource']);
    copyFirstString(hostTurnMeta, 'surface', meta, ['surface', 'hostSurface']);
    copyFirstString(hostTurnMeta, 'timestamp', meta, ['timestamp', 'createdAt']);
    copyFirstString(hostTurnMeta, 'language', meta, ['language']);
    copyFirstString(hostTurnMeta, 'activeFile', meta, ['activeFile', 'filePath']);
    copyFirstString(hostTurnMeta, 'cwd', meta, ['cwd']);
    copyFirstString(hostTurnMeta, 'projectRoot', meta, ['projectRoot']);
    copyFirstString(hostTurnMeta, 'workspaceRoot', meta, ['workspaceRoot']);
    return Object.keys(hostTurnMeta).length > 0 ? hostTurnMeta : undefined;
}
function normalizeHostDeclaredIntent(input) {
    if (input === undefined || input === null) {
        return { degradedReasons: [] };
    }
    const record = asRecord(input);
    if (!record) {
        return { degradedReasons: ['hostDeclaredIntent.notObject'] };
    }
    const value = {};
    assignString(value, 'query', record.query, 1200);
    assignString(value, 'summary', record.summary, 1200);
    assignString(value, 'goal', record.goal, 600);
    assignString(value, 'action', record.action, 600);
    assignString(value, 'scenario', record.scenario, 80);
    assignString(value, 'language', record.language, 80);
    assignString(value, 'module', record.module, 160);
    assignString(value, 'source', record.source, 120);
    const labels = normalizeStringArray(record.labels, 12, 80);
    if (labels.length > 0) {
        value.labels = labels;
    }
    const keywords = normalizeStringArray(record.keywords, 12, 80);
    if (keywords.length > 0) {
        value.keywords = keywords;
    }
    const sourceRefs = normalizeSourceRefs(record.sourceRefs);
    if (sourceRefs.length > 0) {
        value.sourceRefs = sourceRefs;
    }
    if (typeof record.confidence === 'number' && Number.isFinite(record.confidence)) {
        value.confidence = Math.max(0, Math.min(1, record.confidence));
    }
    return Object.keys(value).length > 0
        ? { value, degradedReasons: [] }
        : { degradedReasons: ['hostDeclaredIntent.emptyAfterAllowlist'] };
}
function normalizeHostTurnMeta(input) {
    if (input === undefined || input === null) {
        return { degradedReasons: [] };
    }
    const record = asRecord(input);
    if (!record) {
        return { degradedReasons: ['hostTurnMeta.notObject'] };
    }
    const value = { redactions: [] };
    assignString(value, 'turnId', firstValue(record, ['turnId', 'turn_id']), 160);
    assignString(value, 'messageId', firstValue(record, ['messageId', 'message_id']), 160);
    assignString(value, 'source', record.source, 120);
    assignString(value, 'surface', record.surface, 120);
    assignString(value, 'timestamp', record.timestamp, 120);
    assignString(value, 'language', record.language, 80);
    assignHashedId(value, 'threadIdHash', firstValue(record, ['threadId', 'thread_id']));
    assignHashedId(value, 'conversationIdHash', firstValue(record, ['conversationId', 'conversation_id']));
    assignHashedId(value, 'sessionIdHash', firstValue(record, ['sessionId', 'session_id']));
    markPathRedactions(value, record);
    value.redactions = uniqueStrings(value.redactions);
    return hasTurnMetaValue(value) ? { value, degradedReasons: [] } : { degradedReasons: [] };
}
function buildRecognizedIntentDraft(input, extracted, confidence) {
    const declared = input.hostDeclaredIntent;
    const query = firstDefinedString(declared?.query, declared?.summary, declared?.goal, declared?.action, input.userQuery, extracted.queries[0]);
    const action = normalizeIntentAction(declared?.action) ?? classifyAction(query, extracted.scenario);
    const target = firstDefinedString(normalizeDraftToken(declared?.module, 160), extractTargetFromQuery(query), sanitizeExtractedModule(extracted.module), activeFileName(input.activeFile));
    const constraints = buildDraftConstraints(declared, extracted.scenario);
    const language = declared?.language ?? input.language ?? extracted.language ?? input.hostTurnMeta?.language;
    const sourceRefs = normalizeSourceRefs(declared?.sourceRefs);
    const evidenceSpans = buildEvidenceSpans({
        action,
        constraints,
        declared,
        input,
        language,
        query,
        target,
    });
    const degradedReasons = [...input.degradedReasons];
    if (!query) {
        degradedReasons.push('recognizedIntent.queryMissing');
    }
    if (confidence < 0.5) {
        degradedReasons.push('recognizedIntent.lowConfidence');
    }
    const status = resolveDraftStatus(query, confidence, degradedReasons);
    return {
        query: query ?? '',
        action,
        ...(target ? { target } : {}),
        constraints,
        ...(language ? { language } : {}),
        confidence,
        source: input.source,
        status,
        degraded: status !== 'recognized',
        degradedReasons: uniqueStrings(degradedReasons),
        evidenceSpans,
        sourceRefs,
    };
}
function summarizeRecognizedIntentDraft(draft, options) {
    return {
        action: draft.action,
        confidence: draft.confidence,
        constraints: draft.constraints,
        degraded: draft.degraded,
        degradedReasons: draft.degradedReasons,
        evidenceSpans: draft.evidenceSpans.slice(0, 8),
        language: draft.language,
        query: draft.query,
        source: draft.source,
        sourceRefs: uniqueStrings([...(draft.sourceRefs ?? []), ...(options.sourceRefs ?? [])]),
        status: draft.status,
        target: draft.target,
    };
}
function mergeHostTurnMeta(requestMeta, explicitMeta) {
    if (!requestMeta && !explicitMeta) {
        return undefined;
    }
    return {
        redactions: uniqueStrings([
            ...(requestMeta?.redactions ?? []),
            ...(explicitMeta?.redactions ?? []),
        ]),
        ...(requestMeta?.turnId ? { turnId: requestMeta.turnId } : {}),
        ...(requestMeta?.messageId ? { messageId: requestMeta.messageId } : {}),
        ...(requestMeta?.source ? { source: requestMeta.source } : {}),
        ...(requestMeta?.surface ? { surface: requestMeta.surface } : {}),
        ...(requestMeta?.timestamp ? { timestamp: requestMeta.timestamp } : {}),
        ...(requestMeta?.language ? { language: requestMeta.language } : {}),
        ...(requestMeta?.threadIdHash ? { threadIdHash: requestMeta.threadIdHash } : {}),
        ...(requestMeta?.conversationIdHash
            ? { conversationIdHash: requestMeta.conversationIdHash }
            : {}),
        ...(requestMeta?.sessionIdHash ? { sessionIdHash: requestMeta.sessionIdHash } : {}),
        ...(explicitMeta?.turnId ? { turnId: explicitMeta.turnId } : {}),
        ...(explicitMeta?.messageId ? { messageId: explicitMeta.messageId } : {}),
        ...(explicitMeta?.source ? { source: explicitMeta.source } : {}),
        ...(explicitMeta?.surface ? { surface: explicitMeta.surface } : {}),
        ...(explicitMeta?.timestamp ? { timestamp: explicitMeta.timestamp } : {}),
        ...(explicitMeta?.language ? { language: explicitMeta.language } : {}),
        ...(explicitMeta?.threadIdHash ? { threadIdHash: explicitMeta.threadIdHash } : {}),
        ...(explicitMeta?.conversationIdHash
            ? { conversationIdHash: explicitMeta.conversationIdHash }
            : {}),
        ...(explicitMeta?.sessionIdHash ? { sessionIdHash: explicitMeta.sessionIdHash } : {}),
    };
}
function resolveSource(hasUserQuery, hasHostDeclaredIntent) {
    if (hasUserQuery && hasHostDeclaredIntent) {
        return 'mixed';
    }
    if (hasHostDeclaredIntent) {
        return 'host-declared';
    }
    return 'deterministic';
}
function looksLikeAutomationEnvelopeText(value) {
    if (!value) {
        return false;
    }
    return [
        /<codex_delegation/i,
        /\bControllerDispatchPacket\b/i,
        /\bControllerReturnEnvelope\b/i,
        /\bDeliveryEnvelope\b/i,
        /\bTargetResultEnvelope\b/i,
        /\bdispatchGroup\s*:/i,
        /\bcurrentWindow\s*:/i,
        /\bcontrollerWindow\s*:/i,
        /\btaskId\s*:/i,
        /继续当前窗口任务/i,
        /继续总控验收/i,
    ].some((pattern) => pattern.test(value));
}
function resolveConfidence(input) {
    if (input.hostDeclaredIntent?.confidence !== undefined) {
        return input.hostDeclaredIntent.confidence;
    }
    return input.source === 'deterministic' ? 1 : 0.75;
}
function resolveDraftStatus(query, confidence, degradedReasons) {
    if (!query || degradedReasons.some((reason) => reason !== 'recognizedIntent.lowConfidence')) {
        return 'degraded';
    }
    if (confidence < 0.5) {
        return 'needs-confirmation';
    }
    return 'recognized';
}
function normalizeIntentAction(value) {
    return normalizeDraftToken(value, 80);
}
function classifyAction(query, scenario) {
    const lower = (query ?? '').toLowerCase();
    if (/fix|bug|修复|报错|失败|失败了/.test(lower)) {
        return 'fix';
    }
    if (/review|检查|审查|lint|合规|guard/.test(lower)) {
        return 'review';
    }
    if (/refactor|重构|整理|收敛/.test(lower)) {
        return 'refactor';
    }
    if (/implement|add|create|build|新增|实现|开发|编写|创建/.test(lower)) {
        return 'implement';
    }
    if (/delete|remove|清理|删除/.test(lower)) {
        return 'remove';
    }
    return scenario || 'search';
}
function buildDraftConstraints(declared, scenario) {
    const constraints = uniqueStrings([
        ...(declared?.labels ?? []),
        ...(declared?.keywords ?? []),
        ...(declared?.scenario ? [declared.scenario] : []),
        scenario,
    ])
        .map((value) => normalizeDraftToken(value, 80))
        .filter((value) => Boolean(value));
    return constraints.slice(0, 12);
}
function buildEvidenceSpans(input) {
    const spans = [];
    pushEvidence(spans, {
        container: input.input.userQuery,
        field: 'query',
        source: 'userQuery',
        text: input.query,
    });
    pushEvidence(spans, {
        container: firstDefinedString(input.declared?.query, input.declared?.summary, input.declared?.goal, input.declared?.action),
        field: 'query',
        source: 'hostDeclaredIntent',
        text: input.query,
    });
    pushEvidence(spans, {
        container: input.declared?.action ?? input.input.userQuery,
        field: 'action',
        source: input.declared?.action ? 'hostDeclaredIntent' : 'deterministic',
        text: input.action,
    });
    pushEvidence(spans, {
        container: input.declared?.module ?? input.input.activeFile ?? input.input.userQuery,
        field: 'target',
        redacted: Boolean(input.input.activeFile && input.target === activeFileName(input.input.activeFile)),
        source: input.declared?.module
            ? 'hostDeclaredIntent'
            : input.input.activeFile
                ? 'activeFile'
                : 'deterministic',
        text: input.target,
    });
    for (const constraint of input.constraints) {
        pushEvidence(spans, {
            container: [...(input.declared?.labels ?? []), ...(input.declared?.keywords ?? [])].join(' '),
            field: 'constraints',
            source: 'hostDeclaredIntent',
            text: constraint,
        });
    }
    pushEvidence(spans, {
        container: input.declared?.language ?? input.input.language ?? input.input.hostTurnMeta?.language,
        field: 'language',
        source: input.declared?.language ? 'hostDeclaredIntent' : 'deterministic',
        text: input.language ?? undefined,
    });
    return dedupeEvidenceSpans(spans).slice(0, 12);
}
function pushEvidence(spans, input) {
    const text = normalizeEvidenceText(input.text);
    if (!text || looksLikePrivatePath(text)) {
        return;
    }
    const container = input.container ?? '';
    const start = container ? container.indexOf(text) : -1;
    spans.push({
        source: input.source,
        field: input.field,
        text,
        start: start >= 0 ? start : null,
        end: start >= 0 ? start + text.length : null,
        ...(input.redacted ? { redacted: true } : {}),
    });
}
function dedupeEvidenceSpans(spans) {
    const seen = new Set();
    const result = [];
    for (const span of spans) {
        const key = `${span.source}\0${span.field}\0${span.text}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        result.push(span);
    }
    return result;
}
function hasTurnMetaValue(value) {
    return Object.keys(value).some((key) => key !== 'redactions') || value.redactions.length > 0;
}
function hasResidentIntentSignal(frame, sourceRefs) {
    return (frame.source !== 'deterministic' ||
        Boolean(frame.hostDeclaredIntent) ||
        Boolean(frame.hostTurnMeta) ||
        frame.degraded ||
        sourceRefs.length > 0);
}
function assignString(target, key, value, maxLength) {
    const normalized = normalizeString(value, maxLength);
    if (normalized) {
        target[key] = normalized;
    }
}
function assignHashedId(target, key, value) {
    const normalized = normalizeString(value, 400);
    if (!normalized) {
        return;
    }
    target[key] = createHash('sha256').update(normalized).digest('hex').slice(0, 16);
    target.redactions.push(key.replace(/Hash$/, ''));
}
function markPathRedactions(target, record) {
    for (const key of ['activeFile', 'filePath', 'cwd', 'projectRoot', 'workspaceRoot']) {
        if (normalizeString(record[key], 1600)) {
            target.redactions.push(key);
        }
    }
}
function firstValue(record, keys) {
    for (const key of keys) {
        if (record[key] !== undefined) {
            return record[key];
        }
    }
    return undefined;
}
function firstDefinedString(...values) {
    return values.find((value) => value !== undefined);
}
function copyFirstString(target, targetKey, source, sourceKeys) {
    const value = normalizeString(firstValue(source, sourceKeys), 1600);
    if (value) {
        target[targetKey] = value;
    }
}
function normalizeString(value, maxLength) {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }
    return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}
function normalizeStringArray(value, maxItems, maxLength) {
    if (!Array.isArray(value)) {
        return [];
    }
    const result = [];
    for (const item of value) {
        const normalized = normalizeString(item, maxLength);
        if (normalized) {
            result.push(normalized);
        }
        if (result.length >= maxItems) {
            break;
        }
    }
    return uniqueStrings(result);
}
function normalizeQueryHints(value) {
    return normalizeStringArray(value, 6, 500).filter((entry) => !looksLikePrivatePath(entry));
}
function normalizeSourceRefs(value) {
    return normalizeStringArray(value, 20, 200).filter((entry) => !looksLikePrivatePath(entry));
}
function normalizeDraftToken(value, maxLength) {
    const normalized = normalizeString(value, maxLength);
    if (!normalized || looksLikePrivatePath(normalized)) {
        return undefined;
    }
    return normalized;
}
function normalizeEvidenceText(value) {
    return normalizeDraftToken(value, 200);
}
function sanitizeExtractedModule(value) {
    return normalizeDraftToken(value ?? undefined, 160);
}
function activeFileName(value) {
    const normalized = normalizeString(value, 1600);
    if (!normalized) {
        return undefined;
    }
    const fileName = normalized.replace(/\\/g, '/').split('/').pop();
    return normalizeDraftToken(fileName?.replace(/\.\w+$/, ''), 160);
}
function extractTargetFromQuery(query) {
    if (!query) {
        return undefined;
    }
    const backtick = query.match(/`([^`]{2,120})`/);
    if (backtick?.[1]) {
        return normalizeDraftToken(backtick[1], 120);
    }
    const camelCase = query.match(/\b[A-Z][a-z]+(?:[A-Z][a-z0-9]+)+\b/);
    return normalizeDraftToken(camelCase?.[0], 120);
}
function normalizeResidentDeclaredIntent(declared) {
    if (!declared) {
        return undefined;
    }
    const sourceRefs = normalizeSourceRefs(declared.sourceRefs);
    const normalized = {
        ...declared,
        ...(sourceRefs.length > 0 ? { sourceRefs } : {}),
    };
    if (sourceRefs.length === 0) {
        delete normalized.sourceRefs;
    }
    return normalized;
}
function normalizeSessionHistory(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    const result = [];
    for (const item of value) {
        const record = asRecord(item);
        const content = normalizeString(record?.content, 500) ?? normalizeString(item, 500);
        if (content && !looksLikePrivatePath(content)) {
            result.push({ content });
        }
        if (result.length >= 5) {
            break;
        }
    }
    return result;
}
function looksLikePrivatePath(value) {
    return (value.startsWith('/') ||
        value.startsWith('file://') ||
        /^[A-Za-z]:[\\/]/.test(value) ||
        /(^|[\\/])Users([\\/]|$)/.test(value) ||
        value.includes('/Users/') ||
        value.includes('\\Users\\'));
}
function uniqueStrings(values) {
    return [...new Set(values)];
}
function asRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }
    return value;
}
