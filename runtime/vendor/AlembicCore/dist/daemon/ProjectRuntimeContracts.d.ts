import type { WorkspaceMode } from '../shared/ProjectRegistry.js';
import type { DaemonJobStatus } from './JobStore.js';
import type { AlembicRuntimeDataRootSource } from './RuntimeContracts.js';
export declare const PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION = 1;
export declare const PROJECT_CONNECTION_STATES: readonly ["ready", "stopped", "starting", "stale", "failed", "missing", "unavailable"];
export declare const PROJECT_RUNTIME_DAEMON_STATUSES: readonly ["ready", "starting", "stopped", "stale", "failed", "not-checked"];
export declare const PROJECT_RUNTIME_INTERNAL_AI_CONFIG_SOURCES: readonly ["empty", "process-env", "workspace-settings", "unavailable"];
export type ProjectConnectionState = (typeof PROJECT_CONNECTION_STATES)[number];
export type ProjectRuntimeDaemonStatus = (typeof PROJECT_RUNTIME_DAEMON_STATUSES)[number];
export type ProjectRuntimeInternalAiConfigSource = (typeof PROJECT_RUNTIME_INTERNAL_AI_CONFIG_SOURCES)[number];
export type ProjectRuntimeTarget = {
    projectId: string;
    projectRoot?: never;
} | {
    projectId?: never;
    projectRoot: string;
};
export interface ProjectRuntimeControlState {
    activeProjectId: string | null;
    activeProjectRoot: string | null;
    schemaVersion: typeof PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION;
    selectedAt: string | null;
    selectedProjectId: string | null;
    selectedProjectRoot: string | null;
    updatedAt: string;
}
export interface CreateProjectRuntimeControlStateOptions {
    activeProjectId?: string | null;
    activeProjectRoot?: string | null;
    selectedAt?: string | null;
    selectedProjectId?: string | null;
    selectedProjectRoot?: string | null;
    updatedAt?: string;
}
export interface ProjectRuntimeJobsSummary {
    active: number;
    byStatus: Partial<Record<DaemonJobStatus, number>>;
    jobsDir: string;
    latestJobId: string | null;
    latestUpdatedAt: string | null;
    total: number;
}
export interface ProjectRuntimeFileMonitorSummary {
    acceptedEventSources: string[];
    available: boolean;
    endpoint: string | null;
    mode: string;
}
export interface ProjectRuntimeInternalAiSummary {
    available: boolean;
    configSource: ProjectRuntimeInternalAiConfigSource;
    model: string | null;
    provider: string | null;
}
export interface ProjectRuntimeDaemonSummary {
    dashboardUrl: string | null;
    logPath: string;
    message: string | null;
    pid: number | null;
    pidAlive: boolean;
    ready: boolean;
    statePath: string;
    status: ProjectRuntimeDaemonStatus;
    url: string | null;
}
export interface ProjectRuntimeFlags {
    activeRuntime: boolean;
    missing: boolean;
    selected: boolean;
    stale: boolean;
    unavailable: boolean;
}
export interface ProjectRuntimeRegistrySummary {
    createdAt: string | null;
    id: string | null;
}
export interface ProjectRuntimeScopeOwnerSummary {
    controlPlaneOwner: 'alembic';
    daemonOwner: 'per-project-daemon';
    jobStoreOwner: '@alembic/core/daemon/JobStore';
    runtimeOwner: 'alembic';
}
export interface ProjectRuntimeScopeSummary {
    cacheKey: string;
    daemon: ProjectRuntimeDaemonSummary;
    dashboardUrl: string | null;
    dataRoot: string;
    dataRootSource: AlembicRuntimeDataRootSource;
    databasePath: string;
    displayName: string;
    fileMonitor: ProjectRuntimeFileMonitorSummary;
    flags: ProjectRuntimeFlags;
    ghost: boolean;
    initializedBy: 'project-registry';
    internalAi: ProjectRuntimeInternalAiSummary;
    jobs: ProjectRuntimeJobsSummary;
    mode: WorkspaceMode;
    projectExists: boolean;
    projectId: string | null;
    projectRealpath: string;
    projectRoot: string;
    registered: boolean;
    registry: ProjectRuntimeRegistrySummary;
    runtimeDir: string;
    scope: ProjectRuntimeScopeOwnerSummary;
    status: ProjectConnectionState;
    workspaceExists: boolean;
}
export interface ProjectRuntimeControlSnapshot {
    activeRuntimeProject: ProjectRuntimeScopeSummary | null;
    generatedAt: string;
    projects: ProjectRuntimeScopeSummary[];
    selectedProject: ProjectRuntimeScopeSummary | null;
    state: ProjectRuntimeControlState;
}
export declare function createProjectRuntimeControlState(options?: CreateProjectRuntimeControlStateOptions): ProjectRuntimeControlState;
export declare function isProjectConnectionState(value: unknown): value is ProjectConnectionState;
export declare function normalizeProjectConnectionState(value: unknown): ProjectConnectionState | null;
export declare function isProjectRuntimeTarget(value: unknown): value is ProjectRuntimeTarget;
export declare function hasSelectedProjectRuntime(state: ProjectRuntimeControlState): boolean;
export declare function hasActiveProjectRuntime(state: ProjectRuntimeControlState): boolean;
