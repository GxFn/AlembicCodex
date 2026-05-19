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
export const PROJECT_RUNTIME_INTERNAL_AI_CONFIG_SOURCES = [
    'empty',
    'process-env',
    'workspace-settings',
    'unavailable',
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
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
