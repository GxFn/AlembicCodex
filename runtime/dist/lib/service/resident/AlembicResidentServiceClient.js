import { ALEMBIC_RESIDENT_FEATURES, createAlembicResidentServiceProbe, createAlembicResidentServiceStatus, createAlembicResidentServiceSuccess, createAlembicResidentServiceUnavailable, normalizeAlembicResidentServiceStatus, readDaemonState, resolveDaemonPaths, summarizeAlembicResidentServiceStatus, } from '@alembic/core/daemon';
import { normalizeProjectScopeSummary } from '@alembic/core/shared';
import { WorkspaceResolver } from '@alembic/core/workspace';
const RESIDENT_HEALTH_PATH = '/api/v1/daemon/health';
const RESIDENT_PROJECT_SCOPE_RESOLVE_PATH = '/api/v1/project-scope/resolve-folder';
const RESIDENT_SEARCH_PATH = '/api/v1/search';
const RESIDENT_JOBS_PATH = '/api/v1/jobs';
const PROJECT_SCOPE_UNAVAILABLE_REASON = 'resident project scope unavailable';
export class AlembicResidentServiceClient {
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
    async probe(options = {}) {
        const resolved = await this.#resolveProbe(options);
        return createAlembicResidentServiceProbe(resolved.status, new Date().toISOString());
    }
    async resolveProjectScopeIdentity(options = {}) {
        const resolved = await this.#resolveProbe(options);
        return this.#resolveProjectScopeIdentity(resolved, options.folderPath ?? this.#projectRoot);
    }
    async search(request) {
        const result = await this.searchWithResult(request);
        if (result.ok) {
            return result.value;
        }
        return buildUnavailableSearchResult(result, request);
    }
    async searchWithResult(request) {
        const startedAt = Date.now();
        const requestedMode = normalizeRequestedMode(request.mode);
        const residentRequestMode = normalizeResidentRequestMode(requestedMode);
        const resolved = await this.#resolveProbe();
        const status = resolved.status;
        const projectScopeIdentity = await this.#resolveProjectScopeIdentity(resolved, this.#projectRoot);
        const feature = residentRequestMode === 'semantic' ? 'search.semantic' : 'search.keyword';
        const unavailable = this.#ensureFeatureAvailable(status, feature, {
            requireLocalAlembic: true,
        });
        if (unavailable) {
            return withProjectScopeTelemetry(unavailable, projectScopeIdentity);
        }
        if (!resolved.state?.token) {
            return createAlembicResidentServiceUnavailable(status, 'token-missing', 'Alembic resident service token is missing.', { retryable: true, telemetry: { feature, projectScopeIdentity } });
        }
        const endpoint = new URL(RESIDENT_SEARCH_PATH, status.apiBaseUrl || resolved.state.url);
        endpoint.searchParams.set('q', request.query);
        endpoint.searchParams.set('mode', residentRequestMode);
        endpoint.searchParams.set('limit', String(request.limit ?? 8));
        const type = normalizeResidentType(request.type ?? request.kind);
        if (type) {
            endpoint.searchParams.set('type', type);
        }
        try {
            const response = await this.#fetchJson(endpoint, {
                method: 'GET',
                token: resolved.state.token,
            });
            if (!response.ok ||
                response.payload?.success === false ||
                !isRecord(response.payload?.data)) {
                return createAlembicResidentServiceUnavailable(status, response.ok ? 'request-failed' : reasonForHttpStatus(response.status), extractResponseError(response.payload) || `resident_search_http_${response.status}`, {
                    retryable: true,
                    telemetry: {
                        endpoint: endpoint.toString(),
                        feature,
                        projectScopeIdentity,
                        status: response.status,
                    },
                });
            }
            const data = response.payload.data;
            const items = Array.isArray(data.items) ? data.items : [];
            const searchMeta = isRecord(data.searchMeta) ? data.searchMeta : {};
            return createAlembicResidentServiceSuccess({
                items,
                meta: buildResidentMeta({
                    data,
                    durationMs: Date.now() - startedAt,
                    endpoint: endpoint.toString(),
                    items,
                    projectScopeIdentity,
                    residentRequestMode,
                    requestedMode,
                    searchMeta,
                    status,
                }),
            }, status, { endpoint: endpoint.toString(), feature });
        }
        catch (err) {
            const reason = isTimeoutError(err) ? 'request-timeout' : 'request-failed';
            return createAlembicResidentServiceUnavailable(status, reason, err instanceof Error ? err.message : String(err), {
                retryable: true,
                telemetry: { endpoint: endpoint.toString(), feature, projectScopeIdentity },
            });
        }
    }
    async enqueueJob(kind, options = {}) {
        const resolved = await this.#resolveProbe(options);
        const feature = resolveJobFeature(resolved.status, kind);
        const unavailable = this.#ensureFeatureAvailable(resolved.status, feature, {
            allowEmbeddedPlugin: true,
        });
        if (unavailable) {
            return unavailable;
        }
        return this.#requestJson(resolved, `${RESIDENT_JOBS_PATH}/${kind}`, {
            body: options.body,
            feature,
            method: 'POST',
        });
    }
    async readJob(args, options = {}) {
        const resolved = await this.#resolveProbe(options);
        const feature = resolveJobFeature(resolved.status, args.kind === 'rescan' ? 'rescan' : 'bootstrap');
        const unavailable = this.#ensureAnyJobFeatureAvailable(resolved.status);
        if (unavailable) {
            return unavailable;
        }
        const jobId = typeof args.jobId === 'string' ? args.jobId : '';
        const path = jobId
            ? `${RESIDENT_JOBS_PATH}/${encodeURIComponent(jobId)}`
            : `${RESIDENT_JOBS_PATH}${buildJobQuery(args)}`;
        return this.#requestJson(resolved, path, { feature, method: 'GET' });
    }
    async dashboard(options = {}) {
        const resolved = await this.#resolveProbe(options);
        const unavailable = this.#ensureFeatureAvailable(resolved.status, 'dashboard.handoff', { requireLocalAlembic: true });
        if (unavailable) {
            return unavailable;
        }
        const url = resolved.state?.dashboardUrl ?? null;
        if (!url) {
            return createAlembicResidentServiceUnavailable(resolved.status, 'capability-unavailable', 'Alembic resident service did not provide a Dashboard handoff URL.', { telemetry: { feature: 'dashboard.handoff' } });
        }
        return createAlembicResidentServiceSuccess({
            available: true,
            message: null,
            owner: resolved.status.owner,
            route: resolved.status.route,
            unavailableReason: null,
            url,
        }, resolved.status, { feature: 'dashboard.handoff' });
    }
    async #requestJson(resolved, path, input) {
        if (!resolved.state?.token) {
            return createAlembicResidentServiceUnavailable(resolved.status, 'token-missing', 'Alembic resident service token is missing.', { retryable: true, telemetry: { feature: input.feature, path } });
        }
        const endpoint = new URL(path, resolved.status.apiBaseUrl || resolved.state.url);
        try {
            const response = await this.#fetchJson(endpoint, {
                body: input.body,
                method: input.method,
                token: resolved.state.token,
            });
            if (!response.ok || response.payload?.success === false) {
                return createAlembicResidentServiceUnavailable(resolved.status, response.ok ? 'request-failed' : reasonForHttpStatus(response.status), extractResponseError(response.payload) || `resident_service_http_${response.status}`, {
                    retryable: true,
                    telemetry: {
                        endpoint: endpoint.toString(),
                        feature: input.feature,
                        status: response.status,
                    },
                });
            }
            return createAlembicResidentServiceSuccess(response.payload, resolved.status, {
                endpoint: endpoint.toString(),
                feature: input.feature,
            });
        }
        catch (err) {
            return createAlembicResidentServiceUnavailable(resolved.status, isTimeoutError(err) ? 'request-timeout' : 'request-failed', err instanceof Error ? err.message : String(err), {
                retryable: true,
                telemetry: { endpoint: endpoint.toString(), feature: input.feature },
            });
        }
    }
    async #resolveProjectScopeIdentity(resolved, folderPathInput) {
        const folderPath = normalizeFolderPath(folderPathInput) ?? this.#projectRoot;
        const statusScope = buildProjectScopeIdentityFromSummary({
            capability: null,
            folderPath,
            source: 'resident-service-scope',
            status: resolved.status,
            summary: normalizeProjectScopeSummary(resolved.status.serviceScope.projectIdentity.projectScope),
        });
        if (statusScope.available) {
            return statusScope;
        }
        // ProjectScope 是 Alembic resident 的增强输入；Plugin 只读 resolve 结果。
        // 没有 local Alembic resident、token 或 resolve endpoint 时，降级为单 folder baseline，
        // 并把原因写成 developer-visible 诊断字段，而不是阻断 Codex-facing baseline 搜索。
        if (!isLocalAlembicResident(resolved.status) || !resolved.state?.token) {
            return buildSingleFolderBaselineIdentity({
                detail: resolved.status.message,
                folderPath,
                reason: PROJECT_SCOPE_UNAVAILABLE_REASON,
                status: resolved.status,
            });
        }
        const endpoint = new URL(RESIDENT_PROJECT_SCOPE_RESOLVE_PATH, resolved.status.apiBaseUrl || resolved.state.url);
        endpoint.searchParams.set('folderPath', folderPath);
        try {
            const response = await this.#fetchJson(endpoint, {
                method: 'GET',
                token: resolved.state.token,
            });
            if (!response.ok ||
                response.payload?.success === false ||
                !isRecord(response.payload?.data)) {
                return buildSingleFolderBaselineIdentity({
                    detail: extractResponseError(response.payload) || `project_scope_http_${response.status}`,
                    folderPath,
                    reason: PROJECT_SCOPE_UNAVAILABLE_REASON,
                    status: resolved.status,
                });
            }
            const data = response.payload.data;
            const summary = normalizeProjectScopeSummary(data.summary) ||
                normalizeProjectScopeSummary(resolved.status.serviceScope.projectIdentity.projectScope);
            const capability = isRecord(data.capability) ? data.capability : null;
            const endpointIdentity = buildProjectScopeIdentityFromSummary({
                capability,
                folderPath,
                source: 'resident-project-scope-endpoint',
                status: resolved.status,
                summary,
            });
            if (endpointIdentity.available) {
                return endpointIdentity;
            }
            return buildSingleFolderBaselineIdentity({
                detail: 'ProjectScope resolve endpoint returned no matching summary.',
                folderPath,
                reason: PROJECT_SCOPE_UNAVAILABLE_REASON,
                status: resolved.status,
            });
        }
        catch (err) {
            return buildSingleFolderBaselineIdentity({
                detail: err instanceof Error ? err.message : String(err),
                folderPath,
                reason: PROJECT_SCOPE_UNAVAILABLE_REASON,
                status: resolved.status,
            });
        }
    }
    async #resolveProbe(options = {}) {
        if (options.daemonStatus) {
            return {
                state: options.daemonStatus.state,
                status: statusFromDaemonStatus(options.daemonStatus),
            };
        }
        const state = this.#readState(this.#projectRoot);
        if (!state?.url) {
            return {
                state,
                status: unavailableStatus('not-running', 'No Alembic daemon state is available.', state),
            };
        }
        if (!state.token) {
            return {
                state,
                status: unavailableStatus('token-missing', 'Alembic daemon state is missing its token.', state),
            };
        }
        try {
            const endpoint = new URL(RESIDENT_HEALTH_PATH, state.url);
            const response = await this.#fetchJson(endpoint, { method: 'GET', token: state.token });
            if (!response.ok || response.payload?.success === false) {
                return {
                    state,
                    status: unavailableStatus(response.ok ? 'request-failed' : reasonForHttpStatus(response.status), extractResponseError(response.payload) || `resident_health_http_${response.status}`, state),
                };
            }
            return {
                state,
                status: statusFromHealth(response.payload, state),
            };
        }
        catch (err) {
            return {
                state,
                status: unavailableStatus(isTimeoutError(err) ? 'request-timeout' : 'request-failed', err instanceof Error ? err.message : String(err), state),
            };
        }
    }
    #ensureFeatureAvailable(status, feature, options = {}) {
        if (options.requireLocalAlembic && !isLocalAlembicResident(status)) {
            return createAlembicResidentServiceUnavailable(status, status.route === 'unavailable' ? 'route-unavailable' : 'unsupported-route', 'Alembic resident enhancement requires route=local-alembic-daemon and owner=alembic.', { telemetry: { feature } });
        }
        if (!options.allowEmbeddedPlugin && status.route === 'embedded-plugin-runtime') {
            return createAlembicResidentServiceUnavailable(status, 'unsupported-route', 'Embedded Plugin runtime is a recoverable Codex host-agent route, not Alembic resident enhancement.', { telemetry: { feature } });
        }
        const capability = status.capabilities[feature];
        if (!capability?.available) {
            return createAlembicResidentServiceUnavailable(status, capability?.unavailableReason ?? 'capability-unavailable', capability?.message || `Resident service capability ${feature} is unavailable.`, { telemetry: { feature } });
        }
        return null;
    }
    #ensureAnyJobFeatureAvailable(status) {
        const features = status.route === 'embedded-plugin-runtime'
            ? ['jobs.host-agent-recoverable.bootstrap', 'jobs.host-agent-recoverable.rescan']
            : ['jobs.internal-ai.bootstrap', 'jobs.internal-ai.rescan'];
        if (features.some((feature) => status.capabilities[feature]?.available)) {
            return null;
        }
        return createAlembicResidentServiceUnavailable(status, status.route === 'unavailable' ? 'route-unavailable' : 'capability-unavailable', 'No resident job status capability is available for this route.', { telemetry: { features } });
    }
    async #fetchJson(endpoint, input) {
        const response = await this.#fetch(endpoint, {
            method: input.method,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-alembic-daemon-token': input.token,
            },
            body: input.body ? JSON.stringify(input.body) : undefined,
            signal: this.#timeoutMs > 0 ? AbortSignal.timeout(this.#timeoutMs) : undefined,
        });
        return {
            ok: response.ok,
            payload: (await readJsonResponse(response)),
            status: response.status,
        };
    }
}
function statusFromDaemonStatus(status) {
    if (status.health) {
        return statusFromHealth(status.health, status.state);
    }
    if (status.ready && status.state) {
        return embeddedPluginStatus(status.state);
    }
    return unavailableStatus(status.status === 'stopped' ? 'not-running' : 'request-failed', status.message || 'Alembic daemon is not ready.', status.state);
}
function statusFromHealth(payload, state) {
    const payloadRecord = isRecord(payload) ? payload : null;
    const data = isRecord(payloadRecord?.data) ? payloadRecord.data : null;
    if (data?.residentService) {
        return withStateFallbacks(normalizeAlembicResidentServiceStatus(data.residentService), state);
    }
    if (state) {
        return embeddedPluginStatus(state);
    }
    return unavailableStatus('route-unavailable', 'Daemon health did not expose residentService.', state);
}
function embeddedPluginStatus(state) {
    return createAlembicResidentServiceStatus({
        apiBaseUrl: state.url,
        capabilityOverrides: {
            'dashboard.handoff': unavailableCapability('dashboard.handoff', 'unsupported-route'),
            'file-monitor.git-worktree': unavailableCapability('file-monitor.git-worktree', 'unsupported-route'),
            'jobs.host-agent-recoverable.bootstrap': {
                available: true,
                message: 'Embedded Plugin runtime can recover Codex host-agent bootstrap jobs.',
                owner: 'alembic-plugin',
                route: 'embedded-plugin-runtime',
            },
            'jobs.host-agent-recoverable.rescan': {
                available: true,
                message: 'Embedded Plugin runtime can recover Codex host-agent rescan jobs.',
                owner: 'alembic-plugin',
                route: 'embedded-plugin-runtime',
            },
            'jobs.internal-ai.bootstrap': unavailableCapability('jobs.internal-ai.bootstrap', 'unsupported-route', 'Alembic internal AI jobs require a local Alembic resident daemon.'),
            'jobs.internal-ai.rescan': unavailableCapability('jobs.internal-ai.rescan', 'unsupported-route', 'Alembic internal AI jobs require a local Alembic resident daemon.'),
            'search.keyword': unavailableCapability('search.keyword', 'unsupported-route'),
            'search.semantic': unavailableCapability('search.semantic', 'unsupported-route'),
            'status.health': {
                available: true,
                message: 'Embedded Plugin runtime health is available.',
                owner: 'alembic-plugin',
                route: 'embedded-plugin-runtime',
            },
        },
        message: 'Embedded Plugin runtime is available for Codex host-agent recovery; it is not Alembic resident enhancement.',
        owner: 'alembic-plugin',
        route: 'embedded-plugin-runtime',
        serviceScope: {
            diagnosticPaths: {
                databasePath: state.databasePath,
                dataRoot: state.dataRoot,
                projectRoot: state.projectRoot,
                runtimeDir: resolveDaemonPaths(state.projectRoot).runtimeDir,
                statePath: resolveDaemonPaths(state.projectRoot).statePath,
            },
            kind: 'current-project',
            projectIdentity: {
                dataRootSource: null,
                projectId: state.projectId,
                projectScope: null,
                projectScopeId: null,
                schemaMigrationVersion: state.schemaMigrationVersion,
                workspaceMode: null,
            },
            scopeId: state.projectId ? `plugin:${state.projectId}` : null,
        },
    });
}
function unavailableStatus(reason, message, state) {
    return createAlembicResidentServiceStatus({
        apiBaseUrl: state?.url ?? null,
        capabilityOverrides: Object.fromEntries(ALEMBIC_RESIDENT_FEATURES.map((feature) => [
            feature,
            unavailableCapability(feature, reason, message),
        ])),
        message,
        owner: 'alembic-plugin',
        route: 'unavailable',
        serviceScope: {
            diagnosticPaths: {
                databasePath: state?.databasePath ?? null,
                dataRoot: state?.dataRoot ?? null,
                projectRoot: state?.projectRoot ?? null,
                runtimeDir: state?.projectRoot ? resolveDaemonPaths(state.projectRoot).runtimeDir : null,
                statePath: state?.projectRoot ? resolveDaemonPaths(state.projectRoot).statePath : null,
            },
            kind: state ? 'runtime-only' : 'unknown',
            projectIdentity: {
                dataRootSource: null,
                projectId: state?.projectId ?? null,
                projectScope: null,
                projectScopeId: null,
                schemaMigrationVersion: state?.schemaMigrationVersion ?? null,
                workspaceMode: null,
            },
            scopeId: null,
        },
    });
}
function unavailableCapability(feature, reason, message) {
    return {
        available: false,
        message: message ||
            (feature.startsWith('search.')
                ? 'Search enhancement requires a local Alembic resident daemon.'
                : 'Resident service capability is unavailable for this route.'),
        unavailableReason: reason,
    };
}
function withStateFallbacks(status, state) {
    if (!state || status.apiBaseUrl) {
        return status;
    }
    return { ...status, apiBaseUrl: state.url };
}
function isLocalAlembicResident(status) {
    return status.route === 'local-alembic-daemon' && status.owner === 'alembic';
}
function resolveJobFeature(status, kind) {
    if (status.route === 'embedded-plugin-runtime') {
        return `jobs.host-agent-recoverable.${kind}`;
    }
    return `jobs.internal-ai.${kind}`;
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
        projectScopeIdentity: input.projectScopeIdentity,
        residentService: residentServiceSummary(input.status),
        residentVector,
        resultCount,
        route: 'alembic-resident-service',
        searchMeta: {
            ...meta,
            codexRequestedMode: input.requestedMode,
            projectScopeIdentity: input.projectScopeIdentity,
            residentRequestMode: input.residentRequestMode,
        },
        semanticUsed: booleanFrom(meta.semanticUsed),
        service: stringFrom(meta.service),
        used: input.items.length > 0,
        vectorUsed: booleanFrom(meta.vectorUsed),
        workspace: isRecord(meta.workspace) ? meta.workspace : null,
    };
}
function buildUnavailableSearchResult(result, request) {
    const requestedMode = normalizeRequestedMode(request.mode);
    const residentRequestMode = normalizeResidentRequestMode(requestedMode);
    return {
        items: [],
        meta: {
            attempted: true,
            available: false,
            durationMs: 0,
            reason: result.reason,
            residentRequestMode,
            requestedMode,
            residentService: result.status ? residentServiceSummary(result.status) : undefined,
            projectScopeIdentity: result.telemetry?.projectScopeIdentity,
            residentVector: {
                available: false,
                reason: result.reason,
            },
            resultCount: 0,
            route: 'alembic-resident-service',
            used: false,
        },
    };
}
function withProjectScopeTelemetry(result, projectScopeIdentity) {
    if (result.ok) {
        return result;
    }
    return {
        ...result,
        telemetry: {
            ...(result.telemetry || {}),
            projectScopeIdentity,
        },
    };
}
function buildProjectScopeIdentityFromSummary(input) {
    if (!input.summary) {
        return buildSingleFolderBaselineIdentity({
            folderPath: input.folderPath,
            reason: PROJECT_SCOPE_UNAVAILABLE_REASON,
            status: input.status,
        });
    }
    return {
        available: true,
        controlRoot: input.summary.controlRoot,
        currentFolderId: input.summary.currentFolderId,
        currentFolderPath: input.summary.currentFolderPath,
        dataRoot: input.summary.dataRoot,
        dataRootSource: input.summary.dataRootSource,
        diagnosticProjectRoot: input.folderPath,
        folderCount: input.summary.folderCount,
        folders: input.summary.folders,
        mode: 'project-scope',
        projectId: input.summary.projectId,
        projectRoot: input.folderPath,
        projectScope: input.summary,
        projectScopeCapability: input.capability,
        projectScopeId: input.summary.projectScopeId,
        reason: null,
        resident: {
            owner: input.status.owner,
            route: input.status.route,
            serviceScopeId: input.status.serviceScope.scopeId,
        },
        serviceScopeId: input.status.serviceScope.scopeId,
        source: input.source,
        storageKind: input.summary.storageKind,
        workspaceMode: input.status.serviceScope.projectIdentity.workspaceMode,
    };
}
function buildSingleFolderBaselineIdentity(input) {
    const baseline = resolveSingleFolderBaseline(input.folderPath);
    return {
        available: false,
        controlRoot: null,
        currentFolderId: null,
        currentFolderPath: input.folderPath,
        dataRoot: baseline.dataRoot ?? input.status.serviceScope.diagnosticPaths.dataRoot,
        dataRootSource: baseline.dataRootSource,
        diagnosticProjectRoot: input.folderPath,
        folderCount: 1,
        folders: [],
        mode: 'single-folder-baseline',
        projectId: baseline.projectId ?? input.status.serviceScope.projectIdentity.projectId,
        projectRoot: input.folderPath,
        projectScope: null,
        projectScopeCapability: null,
        projectScopeId: null,
        reason: input.detail ? `${input.reason}: ${input.detail}` : input.reason,
        resident: {
            owner: input.status.owner,
            route: input.status.route,
            serviceScopeId: input.status.serviceScope.scopeId,
        },
        serviceScopeId: input.status.serviceScope.scopeId,
        source: 'plugin-single-folder-baseline',
        storageKind: null,
        workspaceMode: baseline.workspaceMode ?? input.status.serviceScope.projectIdentity.workspaceMode,
    };
}
function resolveSingleFolderBaseline(folderPath) {
    try {
        const resolver = WorkspaceResolver.fromProject(folderPath);
        const facts = resolver.toFacts();
        return {
            dataRoot: resolver.dataRoot,
            dataRootSource: facts.dataRootSource,
            projectId: resolver.projectId,
            workspaceMode: facts.mode,
        };
    }
    catch {
        return {
            dataRoot: null,
            dataRootSource: null,
            projectId: null,
            workspaceMode: null,
        };
    }
}
function normalizeFolderPath(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}
function residentServiceSummary(status) {
    const summary = summarizeAlembicResidentServiceStatus(status);
    return {
        availableFeatures: summary.availableFeatures,
        contractVersion: summary.contractVersion,
        owner: summary.owner,
        route: summary.route,
        serviceScope: summary.serviceScope,
        unavailableReasons: summary.unavailableReasons,
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
    // Codex-facing auto 仍表示“尽量增强”；Alembic resident API 只接受明确模式。
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
function buildJobQuery(args) {
    const params = new URLSearchParams();
    if (args.kind === 'bootstrap' || args.kind === 'rescan') {
        params.set('kind', args.kind);
    }
    if (args.status === 'queued' ||
        args.status === 'running' ||
        args.status === 'completed' ||
        args.status === 'failed' ||
        args.status === 'cancelled') {
        params.set('status', args.status);
    }
    if (typeof args.limit === 'number' && Number.isFinite(args.limit)) {
        params.set('limit', String(args.limit));
    }
    const query = params.toString();
    return query ? `?${query}` : '';
}
function reasonForHttpStatus(status) {
    return status === 401 || status === 403 ? 'token-missing' : 'request-failed';
}
function isTimeoutError(err) {
    return err instanceof DOMException && err.name === 'TimeoutError';
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
