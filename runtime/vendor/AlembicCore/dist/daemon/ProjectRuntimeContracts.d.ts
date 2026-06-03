import type { WorkspaceMode } from '../shared/ProjectRegistry.js';
import type { ProjectScopeSummary } from '../shared/ProjectScope.js';
import type { DaemonJobStatus } from './JobStore.js';
import type { AlembicRuntimeDataRootSource } from './RuntimeContracts.js';
export declare const PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION = 1;
export declare const PROJECT_CONNECTION_STATES: readonly ["ready", "stopped", "starting", "stale", "failed", "missing", "unavailable"];
export declare const PROJECT_RUNTIME_DAEMON_STATUSES: readonly ["ready", "starting", "stopped", "stale", "failed", "not-checked"];
export declare const PROJECT_RUNTIME_API_AI_CONFIG_SOURCES: readonly ["empty", "process-env", "workspace-settings", "unavailable"];
export declare const PROJECT_RUNTIME_CONTRACT_VERSION = 1;
export declare const PROJECT_RUNTIME_REQUIRED_SERVICES: readonly ["project-identity", "project-scope", "daemon", "jobs", "api-ai", "dashboard", "file-monitor"];
export declare const PROJECT_RUNTIME_DEFAULT_REQUIRED_SERVICES: readonly ["project-identity"];
export declare const PROJECT_RUNTIME_READINESS_STATES: readonly ["ready", "degraded", "blocked"];
export declare const PROJECT_RUNTIME_FAILURE_SEVERITIES: readonly ["info", "warning", "error"];
export declare const PROJECT_RUNTIME_FAILURE_REASONS: readonly ["project-identity-missing", "project-not-registered", "project-scope-unavailable", "daemon-not-checked", "daemon-starting", "daemon-stale", "daemon-failed", "daemon-missing", "daemon-unavailable", "jobs-unavailable", "api-ai-unavailable", "dashboard-unavailable", "file-monitor-unavailable", "runtime-unavailable"];
export type ProjectConnectionState = (typeof PROJECT_CONNECTION_STATES)[number];
export type ProjectRuntimeDaemonStatus = (typeof PROJECT_RUNTIME_DAEMON_STATUSES)[number];
export type ProjectRuntimeApiAiConfigSource = (typeof PROJECT_RUNTIME_API_AI_CONFIG_SOURCES)[number];
export type ProjectRuntimeRequiredService = (typeof PROJECT_RUNTIME_REQUIRED_SERVICES)[number];
export type ProjectRuntimeReadinessState = (typeof PROJECT_RUNTIME_READINESS_STATES)[number];
export type ProjectRuntimeFailureSeverity = (typeof PROJECT_RUNTIME_FAILURE_SEVERITIES)[number];
export type ProjectRuntimeFailureReason = (typeof PROJECT_RUNTIME_FAILURE_REASONS)[number];
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
export interface ProjectRuntimeIdentityContract {
    contractVersion: typeof PROJECT_RUNTIME_CONTRACT_VERSION;
    currentFolderId: string | null;
    dataRoot: string | null;
    dataRootSource: AlembicRuntimeDataRootSource | null;
    databasePath: string | null;
    ghost: boolean | null;
    mode: WorkspaceMode | null;
    projectExists: boolean | null;
    projectId: string | null;
    projectRealpath: string | null;
    projectRoot: string | null;
    projectScope: ProjectScopeSummary | null;
    projectScopeId: string | null;
    registered: boolean | null;
    runtimeDir: string | null;
    workspaceExists: boolean | null;
}
export interface CreateProjectRuntimeIdentityContractOptions {
    currentFolderId?: string | null;
    dataRoot?: string | null;
    dataRootSource?: AlembicRuntimeDataRootSource | null;
    databasePath?: string | null;
    ghost?: boolean | null;
    mode?: WorkspaceMode | null;
    projectExists?: boolean | null;
    projectId?: string | null;
    projectRealpath?: string | null;
    projectRoot?: string | null;
    projectScope?: ProjectScopeSummary | null;
    projectScopeId?: string | null;
    registered?: boolean | null;
    runtimeDir?: string | null;
    workspaceExists?: boolean | null;
}
export interface ProjectRuntimeServiceReadiness {
    available: boolean;
    message: string | null;
    reason: ProjectRuntimeFailureReason | null;
    required: boolean;
    service: ProjectRuntimeRequiredService;
    source: string | null;
    state: ProjectRuntimeReadinessState;
}
export interface CreateProjectRuntimeServiceReadinessOptions {
    available: boolean;
    message?: string | null;
    reason?: ProjectRuntimeFailureReason | null;
    required?: boolean;
    service: ProjectRuntimeRequiredService;
    source?: string | null;
}
export interface ProjectRuntimeFailureEnvelope {
    contractVersion: typeof PROJECT_RUNTIME_CONTRACT_VERSION;
    identity: ProjectRuntimeIdentityContract | null;
    message: string;
    reason: ProjectRuntimeFailureReason;
    readinessState: ProjectRuntimeReadinessState;
    service: ProjectRuntimeRequiredService | null;
    severity: ProjectRuntimeFailureSeverity;
    source: string | null;
}
export interface CreateProjectRuntimeFailureEnvelopeOptions {
    identity?: ProjectRuntimeIdentityContract | null;
    message?: string | null;
    reason: ProjectRuntimeFailureReason;
    readinessState?: ProjectRuntimeReadinessState;
    service?: ProjectRuntimeRequiredService | null;
    severity?: ProjectRuntimeFailureSeverity;
    source?: string | null;
}
export interface ProjectRuntimeReadinessSummary {
    contractVersion: typeof PROJECT_RUNTIME_CONTRACT_VERSION;
    failureEnvelopes: ProjectRuntimeFailureEnvelope[];
    identity: ProjectRuntimeIdentityContract | null;
    requiredServices: ProjectRuntimeServiceReadiness[];
    state: ProjectRuntimeReadinessState;
}
export interface SummarizeProjectRuntimeScopeReadinessOptions {
    includeOptionalServices?: boolean;
    requiredServices?: readonly ProjectRuntimeRequiredService[];
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
export interface ProjectRuntimeApiAiSummary {
    available: boolean;
    configSource: ProjectRuntimeApiAiConfigSource;
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
    apiAi: ProjectRuntimeApiAiSummary;
    jobs: ProjectRuntimeJobsSummary;
    mode: WorkspaceMode;
    projectExists: boolean;
    projectId: string | null;
    projectRealpath: string;
    projectRoot: string;
    projectScope?: ProjectScopeSummary | null;
    projectScopeId?: string | null;
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
export declare function createProjectRuntimeIdentityContract(options?: CreateProjectRuntimeIdentityContractOptions): ProjectRuntimeIdentityContract;
export declare function createProjectRuntimeIdentityContractFromScopeSummary(scope: ProjectRuntimeScopeSummary | null): ProjectRuntimeIdentityContract | null;
export declare function isProjectRuntimeRequiredService(value: unknown): value is ProjectRuntimeRequiredService;
export declare function normalizeProjectRuntimeRequiredService(value: unknown): ProjectRuntimeRequiredService | null;
export declare function isProjectRuntimeFailureReason(value: unknown): value is ProjectRuntimeFailureReason;
export declare function normalizeProjectRuntimeFailureReason(value: unknown): ProjectRuntimeFailureReason | null;
export declare function createProjectRuntimeServiceReadiness(options: CreateProjectRuntimeServiceReadinessOptions): ProjectRuntimeServiceReadiness;
export declare function createProjectRuntimeFailureEnvelope(options: CreateProjectRuntimeFailureEnvelopeOptions): ProjectRuntimeFailureEnvelope;
export declare function summarizeProjectRuntimeScopeReadiness(scope: ProjectRuntimeScopeSummary | null, options?: SummarizeProjectRuntimeScopeReadinessOptions): ProjectRuntimeReadinessSummary;
export declare function isProjectConnectionState(value: unknown): value is ProjectConnectionState;
export declare function normalizeProjectConnectionState(value: unknown): ProjectConnectionState | null;
export declare function isProjectRuntimeTarget(value: unknown): value is ProjectRuntimeTarget;
export declare function hasSelectedProjectRuntime(state: ProjectRuntimeControlState): boolean;
export declare function hasActiveProjectRuntime(state: ProjectRuntimeControlState): boolean;
