import { createProjectScopeEndpointCapability, normalizeProjectScopeSummary, } from '../shared/ProjectScope.js';
import { HOST_EDIT_SOURCE, LEGACY_IDE_EDIT_SOURCE, } from '../shared/source-contracts.js';
import { ALEMBIC_JOB_PROCESS_EVENTS_PATH, createJobProcessEventEndpointCapability, JOB_PROCESS_EVENT_DISPLAY_POLICIES, JOB_PROCESS_EVENT_KINDS, JOB_PROCESS_EVENT_RETENTION_POLICIES, JOB_PROCESS_EVENT_SOURCE_CLASSES, } from './JobProcessEventContracts.js';
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
export const ALEMBIC_RUNTIME_DATA_ROOT_SOURCES = ['project-root', 'ghost-registry'];
export const ALEMBIC_JOB_KINDS = ['bootstrap', 'rescan'];
export const ALEMBIC_JOB_ENDPOINTS = {
    bootstrap: '/api/v1/jobs/bootstrap',
    events: ALEMBIC_JOB_PROCESS_EVENTS_PATH,
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
export function createAlembicRuntimeProjectIdentity(options) {
    return {
        dataRoot: options.dataRoot,
        dataRootSource: options.dataRootSource,
        databasePath: options.databasePath,
        projectId: options.projectId,
        projectRoot: options.projectRoot,
        projectScope: options.projectScope ?? null,
        projectScopeId: options.projectScope?.projectScopeId ?? options.projectScopeId ?? null,
        runtimeDir: options.runtimeDir,
        schemaMigrationVersion: options.schemaMigrationVersion ?? null,
        // workspaceMode 可由 provider 显式传入；缺省时按 dataRootSource 推导，方便外层渐进接入。
        workspaceMode: options.workspaceMode ?? inferWorkspaceModeFromDataRootSource(options.dataRootSource),
    };
}
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
        apiAi: options.apiAi,
        fileMonitor: {
            acceptedEventSources: [...ALEMBIC_FILE_MONITOR_EVENT_SOURCES],
            available: options.fileMonitorAvailable ?? false,
            compatibilityAliases: { ...ALEMBIC_FILE_MONITOR_COMPATIBILITY_ALIASES },
            endpoint: options.fileMonitorEndpoint ?? ALEMBIC_FILE_CHANGES_PATH,
            mode: options.fileMonitorMode ?? 'disabled',
        },
        jobs: {
            available: options.jobsAvailable ?? true,
            endpoints: {
                ...ALEMBIC_JOB_ENDPOINTS,
                ...options.jobEndpoints,
            },
            processEvents: createJobProcessEventEndpointCapability(options.jobProcessEvents),
            kinds: jobKinds,
        },
        projectScope: createProjectScopeEndpointCapability(options.projectScope),
    };
}
export function createAlembicRuntimeHealthData(options) {
    const projectIdentity = createAlembicRuntimeProjectIdentity(options);
    return {
        capabilities: options.capabilities,
        dashboardUrl: options.dashboardUrl ?? null,
        ...projectIdentity,
        enhancement: createAlembicRuntimeEnhancementIdentity({
            version: options.version,
            ...options.enhancement,
        }),
        mode: options.mode,
        pid: options.pid,
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
    const apiAi = asRecord(capabilities?.apiAi);
    const dashboard = asRecord(capabilities?.dashboard);
    const fileMonitor = asRecord(capabilities?.fileMonitor);
    const jobs = asRecord(capabilities?.jobs);
    const processEvents = asRecord(jobs?.processEvents);
    const projectScope = asRecord(capabilities?.projectScope);
    const projectScopeEndpoints = asRecord(projectScope?.endpoints);
    return {
        apiAvailable: booleanOrNull(api?.available),
        apiAiAvailable: booleanOrNull(apiAi?.available),
        dashboardAvailable: booleanOrNull(dashboard?.available),
        dashboardUrl: firstString(dashboard?.url),
        fileMonitorAvailable: booleanOrNull(fileMonitor?.available),
        fileMonitorMode: normalizeAlembicFileMonitorMode(fileMonitor?.mode),
        jobEventsAvailable: booleanOrNull(processEvents?.available),
        jobEventDisplayPolicies: processEvents
            ? stringArray(processEvents.supportedDisplayPolicies ?? JOB_PROCESS_EVENT_DISPLAY_POLICIES)
            : [],
        jobEventsEndpoint: firstString(processEvents?.endpoint),
        jobEventKinds: processEvents
            ? stringArray(processEvents.supportedKinds ?? JOB_PROCESS_EVENT_KINDS)
            : [],
        jobEventRetentionPolicies: processEvents
            ? stringArray(processEvents.supportedRetentionPolicies ?? JOB_PROCESS_EVENT_RETENTION_POLICIES)
            : [],
        jobEventSourceClasses: processEvents
            ? stringArray(processEvents.supportedSourceClasses ?? JOB_PROCESS_EVENT_SOURCE_CLASSES)
            : [],
        jobsAvailable: booleanOrNull(jobs?.available),
        jobKinds: stringArray(jobs?.kinds),
        projectScopeAvailable: booleanOrNull(projectScope?.available),
        projectScopeEndpoint: firstString(projectScopeEndpoints?.readScope, projectScope?.endpoint),
        projectScopeStorageKind: firstString(projectScope?.storageKind),
        projectScopeSupportedOperations: stringArray(projectScope?.supportedOperations),
    };
}
export function summarizeAlembicRuntimeProjectIdentity(value) {
    const identity = asRecord(value);
    return {
        dataRoot: firstString(identity?.dataRoot),
        dataRootSource: normalizeAlembicRuntimeDataRootSource(identity?.dataRootSource),
        databasePath: firstString(identity?.databasePath),
        projectId: nullableString(identity?.projectId),
        projectRoot: firstString(identity?.projectRoot),
        projectScope: normalizeProjectScopeSummary(identity?.projectScope),
        projectScopeId: nullableString(identity?.projectScopeId),
        runtimeDir: firstString(identity?.runtimeDir),
        schemaMigrationVersion: nullableString(identity?.schemaMigrationVersion),
        workspaceMode: normalizeAlembicWorkspaceMode(identity?.workspaceMode),
    };
}
export function isAlembicRuntimeDataRootSource(value) {
    return typeof value === 'string' && ALEMBIC_RUNTIME_DATA_ROOT_SOURCES.includes(value);
}
export function normalizeAlembicRuntimeDataRootSource(value) {
    return isAlembicRuntimeDataRootSource(value) ? value : null;
}
export function normalizeAlembicWorkspaceMode(value) {
    return value === 'standard' || value === 'ghost' ? value : null;
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
function nullableString(value) {
    return typeof value === 'string' ? value : null;
}
function inferWorkspaceModeFromDataRootSource(source) {
    return source === 'ghost-registry' ? 'ghost' : 'standard';
}
function stringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string');
}
