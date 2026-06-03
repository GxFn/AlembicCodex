export const PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION = 1;
export const PROJECT_CONNECTION_STATES = [
    'ready',
    'stopped',
    'starting',
    'stale',
    'failed',
    'missing',
    'unavailable',
];
export const PROJECT_RUNTIME_DAEMON_STATUSES = [
    'ready',
    'starting',
    'stopped',
    'stale',
    'failed',
    'not-checked',
];
export const PROJECT_RUNTIME_API_AI_CONFIG_SOURCES = [
    'empty',
    'process-env',
    'workspace-settings',
    'unavailable',
];
export const PROJECT_RUNTIME_CONTRACT_VERSION = 1;
export const PROJECT_RUNTIME_REQUIRED_SERVICES = [
    'project-identity',
    'project-scope',
    'daemon',
    'jobs',
    'api-ai',
    'dashboard',
    'file-monitor',
];
export const PROJECT_RUNTIME_DEFAULT_REQUIRED_SERVICES = ['project-identity'];
export const PROJECT_RUNTIME_READINESS_STATES = ['ready', 'degraded', 'blocked'];
export const PROJECT_RUNTIME_FAILURE_SEVERITIES = ['info', 'warning', 'error'];
export const PROJECT_RUNTIME_FAILURE_REASONS = [
    'project-identity-missing',
    'project-not-registered',
    'project-scope-unavailable',
    'daemon-not-checked',
    'daemon-starting',
    'daemon-stale',
    'daemon-failed',
    'daemon-missing',
    'daemon-unavailable',
    'jobs-unavailable',
    'api-ai-unavailable',
    'dashboard-unavailable',
    'file-monitor-unavailable',
    'runtime-unavailable',
];
export function createProjectRuntimeControlState(options = {}) {
    const updatedAt = options.updatedAt ?? new Date(0).toISOString();
    return {
        activeProjectId: options.activeProjectId ?? null,
        activeProjectRoot: options.activeProjectRoot ?? null,
        schemaVersion: PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION,
        selectedAt: options.selectedAt ?? null,
        selectedProjectId: options.selectedProjectId ?? null,
        selectedProjectRoot: options.selectedProjectRoot ?? null,
        updatedAt,
    };
}
export function createProjectRuntimeIdentityContract(options = {}) {
    return {
        contractVersion: PROJECT_RUNTIME_CONTRACT_VERSION,
        currentFolderId: options.currentFolderId ?? options.projectScope?.currentFolderId ?? null,
        dataRoot: options.dataRoot ?? options.projectScope?.dataRoot ?? null,
        dataRootSource: options.dataRootSource ?? options.projectScope?.dataRootSource ?? null,
        databasePath: options.databasePath ?? null,
        ghost: options.ghost ?? null,
        mode: options.mode ?? null,
        projectExists: options.projectExists ?? null,
        projectId: options.projectId ?? options.projectScope?.projectId ?? null,
        projectRealpath: options.projectRealpath ?? null,
        projectRoot: options.projectRoot ?? options.projectScope?.currentFolderPath ?? null,
        projectScope: options.projectScope ?? null,
        projectScopeId: options.projectScopeId ?? options.projectScope?.projectScopeId ?? null,
        registered: options.registered ?? null,
        runtimeDir: options.runtimeDir ?? null,
        workspaceExists: options.workspaceExists ?? null,
    };
}
export function createProjectRuntimeIdentityContractFromScopeSummary(scope) {
    if (!scope) {
        return null;
    }
    return createProjectRuntimeIdentityContract({
        currentFolderId: scope.projectScope?.currentFolderId ?? null,
        dataRoot: scope.dataRoot,
        dataRootSource: scope.dataRootSource,
        databasePath: scope.databasePath,
        ghost: scope.ghost,
        mode: scope.mode,
        projectExists: scope.projectExists,
        projectId: scope.projectId,
        projectRealpath: scope.projectRealpath,
        projectRoot: scope.projectRoot,
        projectScope: scope.projectScope ?? null,
        projectScopeId: scope.projectScopeId ?? scope.projectScope?.projectScopeId ?? null,
        registered: scope.registered,
        runtimeDir: scope.runtimeDir,
        workspaceExists: scope.workspaceExists,
    });
}
export function isProjectRuntimeRequiredService(value) {
    return (typeof value === 'string' &&
        PROJECT_RUNTIME_REQUIRED_SERVICES.includes(value));
}
export function normalizeProjectRuntimeRequiredService(value) {
    return isProjectRuntimeRequiredService(value) ? value : null;
}
export function isProjectRuntimeFailureReason(value) {
    return (typeof value === 'string' &&
        PROJECT_RUNTIME_FAILURE_REASONS.includes(value));
}
export function normalizeProjectRuntimeFailureReason(value) {
    return isProjectRuntimeFailureReason(value) ? value : null;
}
export function createProjectRuntimeServiceReadiness(options) {
    const required = options.required ?? false;
    const state = options.available
        ? 'ready'
        : required
            ? 'blocked'
            : 'degraded';
    return {
        available: options.available,
        message: options.message ?? null,
        reason: options.available ? null : (options.reason ?? 'runtime-unavailable'),
        required,
        service: options.service,
        source: options.source ?? null,
        state,
    };
}
export function createProjectRuntimeFailureEnvelope(options) {
    const readinessState = options.readinessState ?? 'blocked';
    return {
        contractVersion: PROJECT_RUNTIME_CONTRACT_VERSION,
        identity: options.identity ?? null,
        message: options.message ?? PROJECT_RUNTIME_FAILURE_MESSAGES[options.reason],
        reason: options.reason,
        readinessState,
        service: options.service ?? null,
        severity: options.severity ?? (readinessState === 'blocked' ? 'error' : 'warning'),
        source: options.source ?? null,
    };
}
export function summarizeProjectRuntimeScopeReadiness(scope, options = {}) {
    const identity = createProjectRuntimeIdentityContractFromScopeSummary(scope);
    const requiredServices = new Set(options.requiredServices ?? PROJECT_RUNTIME_DEFAULT_REQUIRED_SERVICES);
    const services = options.includeOptionalServices === false
        ? [...requiredServices]
        : [...PROJECT_RUNTIME_REQUIRED_SERVICES];
    const requiredServiceReadiness = services.map((service) => createReadinessForService(service, scope, identity, requiredServices.has(service)));
    const state = summarizeReadinessState(requiredServiceReadiness);
    const failureEnvelopes = requiredServiceReadiness
        .filter((service) => service.state !== 'ready' && service.reason)
        .map((service) => createProjectRuntimeFailureEnvelope({
        identity,
        message: service.message,
        readinessState: service.state,
        reason: service.reason ?? 'runtime-unavailable',
        service: service.service,
        source: service.source,
    }));
    return {
        contractVersion: PROJECT_RUNTIME_CONTRACT_VERSION,
        failureEnvelopes,
        identity,
        requiredServices: requiredServiceReadiness,
        state,
    };
}
export function isProjectConnectionState(value) {
    return typeof value === 'string' && PROJECT_CONNECTION_STATES.includes(value);
}
export function normalizeProjectConnectionState(value) {
    return isProjectConnectionState(value) ? value : null;
}
export function isProjectRuntimeTarget(value) {
    const target = asRecord(value);
    if (!target) {
        return false;
    }
    const hasProjectId = isNonEmptyString(target.projectId);
    const hasProjectRoot = isNonEmptyString(target.projectRoot);
    // 目标解析必须是 projectId / projectRoot 二选一，避免下游 route 猜测优先级。
    return hasProjectId !== hasProjectRoot;
}
export function hasSelectedProjectRuntime(state) {
    return isNonEmptyString(state.selectedProjectId) || isNonEmptyString(state.selectedProjectRoot);
}
export function hasActiveProjectRuntime(state) {
    return isNonEmptyString(state.activeProjectId) || isNonEmptyString(state.activeProjectRoot);
}
const PROJECT_RUNTIME_FAILURE_MESSAGES = {
    'api-ai-unavailable': 'API AI provider is unavailable for the selected project runtime.',
    'dashboard-unavailable': 'Dashboard service is unavailable for the selected project runtime.',
    'daemon-failed': 'Local daemon failed for the selected project runtime.',
    'daemon-missing': 'Local daemon state is missing for the selected project runtime.',
    'daemon-not-checked': 'Local daemon state has not been checked for the selected project runtime.',
    'daemon-stale': 'Local daemon state is stale for the selected project runtime.',
    'daemon-starting': 'Local daemon is still starting for the selected project runtime.',
    'daemon-unavailable': 'Local daemon is unavailable for the selected project runtime.',
    'file-monitor-unavailable': 'File monitor is unavailable for the selected project runtime.',
    'jobs-unavailable': 'Job store is unavailable for the selected project runtime.',
    'project-identity-missing': 'Project identity is missing for the selected project runtime.',
    'project-not-registered': 'Project is not registered in the runtime source of truth.',
    'project-scope-unavailable': 'ProjectScope descriptor is unavailable for the selected project.',
    'runtime-unavailable': 'Runtime service is unavailable for the selected project.',
};
function createReadinessForService(service, scope, identity, required) {
    switch (service) {
        case 'project-identity': {
            const available = hasProjectRuntimeIdentity(identity);
            const reason = available
                ? null
                : scope && scope.registered === false
                    ? 'project-not-registered'
                    : 'project-identity-missing';
            return createProjectRuntimeServiceReadiness({
                available,
                reason,
                required,
                service,
                source: 'project-runtime-identity',
            });
        }
        case 'project-scope':
            return createProjectRuntimeServiceReadiness({
                available: Boolean(identity?.projectScope?.projectScopeId),
                reason: 'project-scope-unavailable',
                required,
                service,
                source: 'project-scope',
            });
        case 'daemon': {
            const reason = getDaemonFailureReason(scope?.daemon);
            return createProjectRuntimeServiceReadiness({
                available: scope?.daemon.ready === true && scope.daemon.status === 'ready',
                message: scope?.daemon.message ?? null,
                reason,
                required,
                service,
                source: 'daemon-state',
            });
        }
        case 'jobs':
            return createProjectRuntimeServiceReadiness({
                available: isNonEmptyString(scope?.jobs.jobsDir),
                reason: 'jobs-unavailable',
                required,
                service,
                source: 'job-store',
            });
        case 'api-ai':
            return createProjectRuntimeServiceReadiness({
                available: scope?.apiAi.available === true,
                reason: 'api-ai-unavailable',
                required,
                service,
                source: scope?.apiAi.configSource ?? 'api-ai',
            });
        case 'dashboard':
            return createProjectRuntimeServiceReadiness({
                available: isNonEmptyString(scope?.dashboardUrl) || isNonEmptyString(scope?.daemon.dashboardUrl),
                reason: 'dashboard-unavailable',
                required,
                service,
                source: 'dashboard',
            });
        case 'file-monitor':
            return createProjectRuntimeServiceReadiness({
                available: scope?.fileMonitor.available === true,
                reason: 'file-monitor-unavailable',
                required,
                service,
                source: 'file-monitor',
            });
    }
}
function summarizeReadinessState(services) {
    if (services.some((service) => service.state === 'blocked')) {
        return 'blocked';
    }
    if (services.some((service) => service.state === 'degraded')) {
        return 'degraded';
    }
    return 'ready';
}
function hasProjectRuntimeIdentity(identity) {
    return (Boolean(identity) &&
        isNonEmptyString(identity?.dataRoot) &&
        isNonEmptyString(identity?.projectRoot) &&
        isNonEmptyString(identity?.runtimeDir) &&
        identity?.registered !== false);
}
function getDaemonFailureReason(daemon) {
    switch (daemon?.status) {
        case 'failed':
            return 'daemon-failed';
        case 'not-checked':
            return 'daemon-not-checked';
        case 'ready':
            return 'daemon-unavailable';
        case 'stale':
            return 'daemon-stale';
        case 'starting':
            return 'daemon-starting';
        case 'stopped':
            return 'daemon-missing';
        default:
            return 'daemon-not-checked';
    }
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
