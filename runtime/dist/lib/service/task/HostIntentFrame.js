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
    const effectiveUserQuery = userQuery ?? declaredQuery ?? '';
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
export function buildHostIntentFrame(input, extracted) {
    return {
        source: input.source,
        confidence: resolveConfidence(input),
        degraded: input.degraded,
        degradedReasons: input.degradedReasons,
        ...(input.hostDeclaredIntent ? { hostDeclaredIntent: input.hostDeclaredIntent } : {}),
        ...(input.hostTurnMeta ? { hostTurnMeta: input.hostTurnMeta } : {}),
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
function resolveConfidence(input) {
    if (input.hostDeclaredIntent?.confidence !== undefined) {
        return input.hostDeclaredIntent.confidence;
    }
    return input.source === 'deterministic' ? 1 : 0.75;
}
function hasTurnMetaValue(value) {
    return Object.keys(value).some((key) => key !== 'redactions') || value.redactions.length > 0;
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
function uniqueStrings(values) {
    return [...new Set(values)];
}
function asRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }
    return value;
}
