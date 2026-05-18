import { HOST_EDIT_SOURCE, LEGACY_IDE_EDIT_SOURCE, } from '../shared/source-contracts.js';
export const ALEMBIC_RUNTIME_API_VERSION = 'v1';
export const ALEMBIC_RUNTIME_PACKAGE_NAME = 'alembic-ai';
export const ALEMBIC_RUNTIME_HEALTH_PATH = '/api/v1/daemon/health';
export const ALEMBIC_FILE_CHANGES_PATH = '/api/v1/file-changes';
export const ALEMBIC_RUNTIME_ROUTE_KINDS = [
    'local-alembic-daemon',
    'embedded-plugin-runtime',
    'local-alembic-install',
    'unavailable',
];
export const ALEMBIC_FILE_MONITOR_MODES = [
    'daemon-git-worktree',
    'host-event-bridge',
    'embedded-runtime-adapter',
    'disabled',
];
export const ALEMBIC_JOB_KINDS = ['bootstrap', 'rescan'];
export const ALEMBIC_JOB_ENDPOINTS = {
    bootstrap: '/api/v1/jobs/bootstrap',
    list: '/api/v1/jobs',
    rescan: '/api/v1/jobs/rescan',
};
export const ALEMBIC_FILE_MONITOR_EVENT_SOURCES = [
    HOST_EDIT_SOURCE,
    'git-head',
    'git-worktree',
];
export const ALEMBIC_FILE_MONITOR_COMPATIBILITY_ALIASES = {
    [LEGACY_IDE_EDIT_SOURCE]: HOST_EDIT_SOURCE,
};
export function createAlembicRuntimeCapabilities(options) {
    const jobKinds = [...(options.jobKinds ?? ALEMBIC_JOB_KINDS)];
    return {
        api: {
            available: options.apiAvailable ?? true,
            baseUrl: options.apiBaseUrl,
            healthPath: ALEMBIC_RUNTIME_HEALTH_PATH,
        },
        dashboard: {
            available: options.dashboardAvailable,
            url: options.dashboardUrl,
        },
        fileMonitor: {
            acceptedEventSources: [...ALEMBIC_FILE_MONITOR_EVENT_SOURCES],
            available: options.fileMonitorAvailable ?? false,
            compatibilityAliases: { ...ALEMBIC_FILE_MONITOR_COMPATIBILITY_ALIASES },
            endpoint: options.fileMonitorEndpoint ?? ALEMBIC_FILE_CHANGES_PATH,
            mode: options.fileMonitorMode ?? 'disabled',
        },
        internalAi: options.internalAi,
        jobs: {
            available: options.jobsAvailable ?? true,
            endpoints: {
                ...ALEMBIC_JOB_ENDPOINTS,
                ...options.jobEndpoints,
            },
            kinds: jobKinds,
        },
    };
}
export function createAlembicRuntimeHealthData(options) {
    return {
        capabilities: options.capabilities,
        dashboardUrl: options.dashboardUrl ?? null,
        dataRoot: options.dataRoot,
        databasePath: options.databasePath,
        enhancement: createAlembicRuntimeEnhancementIdentity({
            version: options.version,
            ...options.enhancement,
        }),
        mode: options.mode,
        pid: options.pid,
        projectId: options.projectId,
        projectRoot: options.projectRoot,
        schemaMigrationVersion: options.schemaMigrationVersion ?? null,
        uptime: options.uptime,
        version: options.version,
    };
}
export function createAlembicRuntimeEnhancementIdentity(input) {
    return {
        apiVersion: input.apiVersion ?? ALEMBIC_RUNTIME_API_VERSION,
        packageName: input.packageName ?? ALEMBIC_RUNTIME_PACKAGE_NAME,
        route: input.route ?? 'local-alembic',
        version: input.version,
    };
}
export function summarizeAlembicRuntimeCapabilities(value) {
    const capabilities = asRecord(value);
    const api = asRecord(capabilities?.api);
    const dashboard = asRecord(capabilities?.dashboard);
    const fileMonitor = asRecord(capabilities?.fileMonitor);
    const internalAi = asRecord(capabilities?.internalAi);
    const jobs = asRecord(capabilities?.jobs);
    return {
        apiAvailable: booleanOrNull(api?.available),
        dashboardAvailable: booleanOrNull(dashboard?.available),
        dashboardUrl: firstString(dashboard?.url),
        fileMonitorAvailable: booleanOrNull(fileMonitor?.available),
        fileMonitorMode: normalizeAlembicFileMonitorMode(fileMonitor?.mode),
        internalAiAvailable: booleanOrNull(internalAi?.available),
        jobsAvailable: booleanOrNull(jobs?.available),
        jobKinds: stringArray(jobs?.kinds),
    };
}
export function isAlembicRuntimeRouteKind(value) {
    return typeof value === 'string' && ALEMBIC_RUNTIME_ROUTE_KINDS.includes(value);
}
export function normalizeAlembicRuntimeRouteKind(value) {
    return isAlembicRuntimeRouteKind(value) ? value : null;
}
export function isAlembicFileMonitorMode(value) {
    return typeof value === 'string' && ALEMBIC_FILE_MONITOR_MODES.includes(value);
}
export function normalizeAlembicFileMonitorMode(value) {
    return isAlembicFileMonitorMode(value) ? value : null;
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function booleanOrNull(value) {
    return typeof value === 'boolean' ? value : null;
}
function firstString(...values) {
    for (const value of values) {
        if (typeof value === 'string' && value.length > 0) {
            return value;
        }
    }
    return null;
}
function stringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string');
}
