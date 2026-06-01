import { ALEMBIC_RUNTIME_HEALTH_PATH, ALEMBIC_RUNTIME_ROUTE_KINDS, normalizeAlembicRuntimeRouteKind, summarizeAlembicRuntimeProjectIdentity, } from './RuntimeContracts.js';
export const ALEMBIC_RESIDENT_SERVICE_CONTRACT_VERSION = 1;
export const ALEMBIC_RESIDENT_ROUTE_KINDS = ALEMBIC_RUNTIME_ROUTE_KINDS;
export const ALEMBIC_RESIDENT_SERVICE_OWNERS = ['alembic', 'alembic-plugin'];
export const ALEMBIC_RESIDENT_SERVICE_SCOPE_KINDS = [
    'current-project',
    'workspace',
    'runtime-only',
    'unknown',
];
export const ALEMBIC_RESIDENT_SERVICE_UNAVAILABLE_REASONS = [
    'not-installed',
    'not-running',
    'token-missing',
    'capability-unavailable',
    'route-unavailable',
    'request-timeout',
    'request-failed',
    'unsupported-route',
    'unknown',
];
export const ALEMBIC_RESIDENT_FEATURES = [
    'status.health',
    'search.keyword',
    'search.semantic',
    'jobs.api-ai.bootstrap',
    'jobs.api-ai.rescan',
    'jobs.host-agent-recoverable.bootstrap',
    'jobs.host-agent-recoverable.rescan',
    'dashboard.handoff',
    'file-monitor.git-worktree',
];
export const ALEMBIC_RESIDENT_API_AI_JOB_FEATURES = [
    'jobs.api-ai.bootstrap',
    'jobs.api-ai.rescan',
];
export const ALEMBIC_RESIDENT_HOST_AGENT_RECOVERABLE_JOB_FEATURES = [
    'jobs.host-agent-recoverable.bootstrap',
    'jobs.host-agent-recoverable.rescan',
];
export const ALEMBIC_RESIDENT_JOB_FEATURES = [
    ...ALEMBIC_RESIDENT_API_AI_JOB_FEATURES,
    ...ALEMBIC_RESIDENT_HOST_AGENT_RECOVERABLE_JOB_FEATURES,
];
export const ALEMBIC_RESIDENT_SEARCH_MODES = ['auto', 'keyword', 'semantic'];
export const ALEMBIC_RESIDENT_SEARCH_RESULT_MODES = [
    'keyword',
    'semantic',
    'hybrid',
    'baseline',
];
export function createAlembicResidentFeatureCapability(feature, options = {}) {
    const route = options.route ?? 'unavailable';
    const owner = options.owner ?? resolveAlembicResidentFeatureOwner(feature, route);
    const available = options.available ?? false;
    return {
        available,
        feature,
        message: options.message ?? null,
        owner,
        route,
        unavailableReason: available
            ? null
            : (options.unavailableReason ?? defaultUnavailableReasonForRoute(route)),
    };
}
export function createAlembicResidentCapabilities(options = {}) {
    const route = options.route ?? 'unavailable';
    const owner = options.owner ?? resolveAlembicResidentRouteOwner(route);
    const capabilities = {};
    for (const feature of ALEMBIC_RESIDENT_FEATURES) {
        const override = options.overrides?.[feature] ?? {};
        const defaultAvailable = options.defaultAvailable ?? false;
        capabilities[feature] = createAlembicResidentFeatureCapability(feature, {
            available: defaultAvailable,
            owner: resolveAlembicResidentFeatureOwner(feature, route, owner),
            route,
            unavailableReason: options.unavailableReason,
            ...override,
        });
    }
    return capabilities;
}
export function createAlembicResidentServiceStatus(options = {}) {
    const route = options.route ?? 'unavailable';
    const owner = options.owner ?? resolveAlembicResidentRouteOwner(route);
    return {
        apiBaseUrl: options.apiBaseUrl ?? null,
        capabilities: createAlembicResidentCapabilities({
            defaultAvailable: options.defaultCapabilityAvailable ?? false,
            overrides: options.capabilityOverrides,
            owner,
            route,
        }),
        contractVersion: ALEMBIC_RESIDENT_SERVICE_CONTRACT_VERSION,
        healthPath: options.healthPath ?? ALEMBIC_RUNTIME_HEALTH_PATH,
        message: options.message ?? null,
        owner,
        route,
        serviceScope: normalizeAlembicResidentServiceScopeSummary(options.serviceScope),
    };
}
export function normalizeAlembicResidentServiceStatus(value) {
    const status = asRecord(value);
    const route = normalizeAlembicResidentRouteKind(status?.route) ?? 'unavailable';
    const owner = normalizeAlembicResidentServiceOwner(status?.owner) ?? resolveAlembicResidentRouteOwner(route);
    return {
        apiBaseUrl: nullableString(status?.apiBaseUrl ?? status?.baseUrl),
        capabilities: normalizeAlembicResidentCapabilities(status?.capabilities, route, owner),
        contractVersion: ALEMBIC_RESIDENT_SERVICE_CONTRACT_VERSION,
        healthPath: firstString(status?.healthPath, ALEMBIC_RUNTIME_HEALTH_PATH),
        message: nullableString(status?.message),
        owner,
        route,
        serviceScope: normalizeAlembicResidentServiceScopeSummary(status?.serviceScope ?? status),
    };
}
export function normalizeAlembicResidentCapabilities(value, route = 'unavailable', owner = resolveAlembicResidentRouteOwner(route)) {
    const capabilitiesInput = asRecord(value);
    const capabilities = {};
    for (const feature of ALEMBIC_RESIDENT_FEATURES) {
        const rawCapability = asRecord(capabilitiesInput?.[feature]);
        const available = booleanOrFalse(rawCapability?.available);
        capabilities[feature] = createAlembicResidentFeatureCapability(feature, {
            available,
            message: nullableString(rawCapability?.message),
            owner: normalizeAlembicResidentServiceOwner(rawCapability?.owner) ??
                resolveAlembicResidentFeatureOwner(feature, route, owner),
            route: normalizeAlembicResidentRouteKind(rawCapability?.route) ?? route,
            unavailableReason: normalizeAlembicResidentServiceUnavailableReason(rawCapability?.unavailableReason),
        });
    }
    return capabilities;
}
export function normalizeAlembicResidentServiceScopeSummary(value) {
    const scope = asRecord(value);
    const projectIdentity = toResidentProjectIdentity(scope?.projectIdentity ?? scope);
    const diagnosticPaths = normalizeAlembicResidentDiagnosticPaths(scope?.diagnosticPaths ?? scope);
    return {
        // serviceScope 只描述当前服务覆盖范围；路径保留在 diagnosticPaths，不能作为项目切换身份。
        diagnosticPaths,
        displayName: nullableString(scope?.displayName),
        kind: normalizeAlembicResidentServiceScopeKind(scope?.kind) ??
            inferServiceScopeKind(projectIdentity, diagnosticPaths),
        projectIdentity,
        scopeId: nullableString(scope?.scopeId),
    };
}
export function normalizeAlembicResidentDiagnosticPaths(value) {
    const paths = asRecord(value);
    return {
        databasePath: nullableString(paths?.databasePath),
        controlRoot: nullableString(paths?.controlRoot),
        dataRoot: nullableString(paths?.dataRoot),
        projectRoot: nullableString(paths?.projectRoot),
        runtimeDir: nullableString(paths?.runtimeDir),
        statePath: nullableString(paths?.statePath),
    };
}
export function summarizeAlembicResidentServiceStatus(status) {
    const availableFeatures = [];
    const unavailableFeatures = [];
    const unavailableReasons = {};
    for (const feature of ALEMBIC_RESIDENT_FEATURES) {
        const capability = status.capabilities[feature];
        if (capability.available) {
            availableFeatures.push(feature);
        }
        else {
            unavailableFeatures.push(feature);
            if (capability.unavailableReason) {
                unavailableReasons[feature] = capability.unavailableReason;
            }
        }
    }
    return {
        availableFeatures,
        contractVersion: status.contractVersion,
        owner: status.owner,
        route: status.route,
        serviceScope: status.serviceScope,
        unavailableFeatures,
        unavailableReasons,
    };
}
export function createAlembicResidentServiceProbe(status, checkedAt) {
    return {
        checkedAt,
        status,
        summary: summarizeAlembicResidentServiceStatus(status),
    };
}
export function createAlembicResidentServiceSuccess(value, status, telemetry) {
    return {
        ok: true,
        owner: status.owner,
        route: status.route,
        status,
        telemetry,
        value,
    };
}
export function createAlembicResidentServiceUnavailable(status, reason, message, options = {}) {
    return {
        errorCode: options.errorCode,
        message,
        ok: false,
        owner: status.owner,
        reason,
        retryable: options.retryable ?? false,
        route: status.route,
        status,
        telemetry: options.telemetry,
    };
}
export function classifyAlembicResidentJobFeature(feature) {
    if (isAlembicResidentApiAiJobFeature(feature)) {
        return 'api-ai';
    }
    if (isAlembicResidentHostAgentRecoverableJobFeature(feature)) {
        return 'host-agent-recoverable';
    }
    return null;
}
export function getAlembicResidentJobOperation(feature) {
    return feature.endsWith('.bootstrap') ? 'bootstrap' : 'rescan';
}
export function resolveAlembicResidentRouteOwner(route) {
    switch (route) {
        case 'local-alembic-daemon':
        case 'local-alembic-install':
            return 'alembic';
        case 'embedded-plugin-runtime':
        case 'unavailable':
            return 'alembic-plugin';
    }
}
export function resolveAlembicResidentFeatureOwner(feature, route = 'unavailable', fallbackOwner = resolveAlembicResidentRouteOwner(route)) {
    const family = classifyAlembicResidentJobFeature(feature);
    if (family === 'api-ai') {
        return 'alembic';
    }
    if (family === 'host-agent-recoverable') {
        return 'alembic-plugin';
    }
    return fallbackOwner;
}
export function isAlembicResidentRouteKind(value) {
    return normalizeAlembicRuntimeRouteKind(value) !== null;
}
export function normalizeAlembicResidentRouteKind(value) {
    return normalizeAlembicRuntimeRouteKind(value);
}
export function isAlembicResidentServiceOwner(value) {
    return typeof value === 'string' && ALEMBIC_RESIDENT_SERVICE_OWNERS.includes(value);
}
export function normalizeAlembicResidentServiceOwner(value) {
    return isAlembicResidentServiceOwner(value) ? value : null;
}
export function isAlembicResidentServiceScopeKind(value) {
    return typeof value === 'string' && ALEMBIC_RESIDENT_SERVICE_SCOPE_KINDS.includes(value);
}
export function normalizeAlembicResidentServiceScopeKind(value) {
    return isAlembicResidentServiceScopeKind(value) ? value : null;
}
export function isAlembicResidentServiceUnavailableReason(value) {
    return (typeof value === 'string' &&
        ALEMBIC_RESIDENT_SERVICE_UNAVAILABLE_REASONS.includes(value));
}
export function normalizeAlembicResidentServiceUnavailableReason(value) {
    return isAlembicResidentServiceUnavailableReason(value) ? value : null;
}
export function isAlembicResidentFeature(value) {
    return typeof value === 'string' && ALEMBIC_RESIDENT_FEATURES.includes(value);
}
export function normalizeAlembicResidentFeature(value) {
    return isAlembicResidentFeature(value) ? value : null;
}
export function isAlembicResidentJobFeature(value) {
    return typeof value === 'string' && ALEMBIC_RESIDENT_JOB_FEATURES.includes(value);
}
export function isAlembicResidentApiAiJobFeature(value) {
    return typeof value === 'string' && ALEMBIC_RESIDENT_API_AI_JOB_FEATURES.includes(value);
}
export function isAlembicResidentHostAgentRecoverableJobFeature(value) {
    return (typeof value === 'string' &&
        ALEMBIC_RESIDENT_HOST_AGENT_RECOVERABLE_JOB_FEATURES.includes(value));
}
function toResidentProjectIdentity(value) {
    const identity = summarizeAlembicRuntimeProjectIdentity(value);
    return {
        dataRootSource: identity.dataRootSource,
        projectId: identity.projectId,
        projectScope: identity.projectScope,
        projectScopeId: identity.projectScopeId,
        schemaMigrationVersion: identity.schemaMigrationVersion,
        workspaceMode: identity.workspaceMode,
    };
}
function inferServiceScopeKind(identity, diagnosticPaths) {
    if (identity.projectId || diagnosticPaths.projectRoot) {
        return 'current-project';
    }
    if (diagnosticPaths.dataRoot || diagnosticPaths.runtimeDir) {
        return 'runtime-only';
    }
    return 'unknown';
}
function defaultUnavailableReasonForRoute(route) {
    return route === 'unavailable' ? 'route-unavailable' : 'capability-unavailable';
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function booleanOrFalse(value) {
    return typeof value === 'boolean' ? value : false;
}
function firstString(...values) {
    for (const value of values) {
        if (typeof value === 'string' && value.length > 0) {
            return value;
        }
    }
    return ALEMBIC_RUNTIME_HEALTH_PATH;
}
function nullableString(value) {
    return typeof value === 'string' ? value : null;
}
