import { readDaemonState, resolveDaemonPaths } from '@alembic/core/daemon';
const RESIDENT_SEARCH_PATH = '/api/v1/search';
export class ResidentSearchClient {
    #fetch;
    #projectRoot;
    #readState;
    #timeoutMs;
    constructor(options) {
        this.#projectRoot = options.projectRoot;
        this.#fetch = options.fetchImpl ?? fetch;
        this.#readState =
            options.readState ??
                ((projectRoot) => {
                    const paths = resolveDaemonPaths(projectRoot);
                    return readDaemonState(paths.statePath);
                });
        this.#timeoutMs = options.timeoutMs ?? 2500;
    }
    async search(request) {
        const startedAt = Date.now();
        const requestedMode = normalizeRequestedMode(request.mode);
        const residentRequestMode = normalizeResidentRequestMode(requestedMode);
        const state = this.#readState(this.#projectRoot);
        if (!state?.url) {
            return this.#unavailable(startedAt, requestedMode, residentRequestMode, 'daemon_state_missing');
        }
        if (!state.token) {
            return this.#unavailable(startedAt, requestedMode, residentRequestMode, 'daemon_token_missing', state);
        }
        const url = new URL(RESIDENT_SEARCH_PATH, state.url);
        url.searchParams.set('q', request.query);
        url.searchParams.set('mode', residentRequestMode);
        url.searchParams.set('limit', String(request.limit ?? 8));
        const type = normalizeResidentType(request.type ?? request.kind);
        if (type) {
            url.searchParams.set('type', type);
        }
        try {
            const response = await this.#fetch(url, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-alembic-daemon-token': state.token,
                },
                signal: this.#timeoutMs > 0 ? AbortSignal.timeout(this.#timeoutMs) : undefined,
            });
            const payload = (await readJsonResponse(response));
            if (!response.ok || payload?.success === false || !isRecord(payload?.data)) {
                return this.#unavailable(startedAt, requestedMode, residentRequestMode, extractResponseError(payload) || `resident_search_http_${response.status}`, state, response.status);
            }
            const data = payload.data;
            const items = Array.isArray(data.items) ? data.items : [];
            const searchMeta = isRecord(data.searchMeta) ? data.searchMeta : {};
            return {
                items,
                meta: buildResidentMeta({
                    data,
                    durationMs: Date.now() - startedAt,
                    endpoint: `${state.url}${RESIDENT_SEARCH_PATH}`,
                    items,
                    residentRequestMode,
                    requestedMode,
                    searchMeta,
                }),
            };
        }
        catch (err) {
            return this.#unavailable(startedAt, requestedMode, residentRequestMode, err instanceof Error ? err.message : String(err), state);
        }
    }
    #unavailable(startedAt, requestedMode, residentRequestMode, reason, state, status) {
        return {
            items: [],
            meta: {
                attempted: true,
                available: false,
                durationMs: Date.now() - startedAt,
                ...(state?.url ? { endpoint: `${state.url}${RESIDENT_SEARCH_PATH}` } : {}),
                reason,
                residentRequestMode,
                requestedMode,
                residentVector: {
                    available: false,
                    reason,
                },
                resultCount: 0,
                route: 'alembic-resident-service',
                ...(typeof status === 'number' ? { status } : {}),
                used: false,
            },
        };
    }
}
function buildResidentMeta(input) {
    const meta = input.searchMeta;
    const residentVector = isRecord(meta.residentVector)
        ? meta.residentVector
        : {
            available: meta.vectorUsed === true ||
                meta.semanticUsed === true ||
                (input.residentRequestMode !== 'semantic' && input.items.length > 0),
            reason: typeof meta.fallbackReason === 'string'
                ? meta.fallbackReason
                : input.residentRequestMode === 'semantic' &&
                    meta.vectorUsed !== true &&
                    meta.semanticUsed !== true
                    ? 'resident_search_telemetry_missing'
                    : null,
        };
    const resultCount = numberFrom(meta.resultCount) ?? numberFrom(input.data.total) ?? input.items.length;
    return {
        actualMode: stringFrom(meta.actualMode ?? input.data.mode),
        attempted: true,
        available: true,
        coreRoute: stringFrom(meta.coreRoute ?? meta.route) ?? null,
        degraded: booleanFrom(meta.degraded),
        degradedReason: stringFrom(meta.degradedReason),
        durationMs: numberFrom(meta.durationMs) ?? input.durationMs,
        endpoint: input.endpoint,
        fallbackReason: stringFrom(meta.fallbackReason),
        residentRequestMode: input.residentRequestMode,
        requestedMode: input.requestedMode,
        residentVector,
        resultCount,
        route: 'alembic-resident-service',
        searchMeta: {
            ...meta,
            codexRequestedMode: input.requestedMode,
            residentRequestMode: input.residentRequestMode,
        },
        semanticUsed: booleanFrom(meta.semanticUsed),
        service: stringFrom(meta.service),
        used: input.items.length > 0,
        vectorUsed: booleanFrom(meta.vectorUsed),
        workspace: isRecord(meta.workspace) ? meta.workspace : null,
    };
}
async function readJsonResponse(response) {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    }
    catch {
        return { success: false, message: text };
    }
}
function extractResponseError(payload) {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const obj = payload;
    return typeof obj.message === 'string'
        ? obj.message
        : typeof obj.error?.message === 'string'
            ? obj.error.message
            : null;
}
function normalizeResidentType(type) {
    if (typeof type !== 'string') {
        return null;
    }
    const normalized = type.trim();
    return normalized && normalized !== 'all' ? normalized : null;
}
function normalizeRequestedMode(mode) {
    if (typeof mode !== 'string') {
        return 'auto';
    }
    const normalized = mode.trim().toLowerCase();
    return normalized || 'auto';
}
function normalizeResidentRequestMode(requestedMode) {
    // AlembicPlugin 的 Codex-facing `auto` 仍表示“尽量增强”；daemon resident API
    // 只接受 keyword/bm25/semantic，所以这里把自动增强翻译成 semantic，
    // 同时在返回 meta 中保留 Codex 原始 requestedMode 供测试和排障读取。
    switch (requestedMode) {
        case 'keyword':
            return 'keyword';
        case 'bm25':
        case 'context':
        case 'weighted':
            return 'bm25';
        case 'semantic':
        case 'auto':
            return 'semantic';
    }
    return 'semantic';
}
function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
function stringFrom(value) {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
function numberFrom(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function booleanFrom(value) {
    return typeof value === 'boolean' ? value : undefined;
}
