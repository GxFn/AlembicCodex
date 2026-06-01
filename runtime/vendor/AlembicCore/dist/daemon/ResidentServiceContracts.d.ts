import type { DaemonJobStatus } from './JobStore.js';
import { type AlembicRuntimeProjectIdentitySummary, type AlembicRuntimeRouteKind } from './RuntimeContracts.js';
export declare const ALEMBIC_RESIDENT_SERVICE_CONTRACT_VERSION = 1;
export declare const ALEMBIC_RESIDENT_ROUTE_KINDS: readonly ["local-alembic-daemon", "embedded-plugin-runtime", "local-alembic-install", "unavailable"];
export declare const ALEMBIC_RESIDENT_SERVICE_OWNERS: readonly ["alembic", "alembic-plugin"];
export declare const ALEMBIC_RESIDENT_SERVICE_SCOPE_KINDS: readonly ["current-project", "workspace", "runtime-only", "unknown"];
export declare const ALEMBIC_RESIDENT_SERVICE_UNAVAILABLE_REASONS: readonly ["not-installed", "not-running", "token-missing", "capability-unavailable", "route-unavailable", "request-timeout", "request-failed", "unsupported-route", "unknown"];
export declare const ALEMBIC_RESIDENT_FEATURES: readonly ["status.health", "search.keyword", "search.semantic", "jobs.api-ai.bootstrap", "jobs.api-ai.rescan", "jobs.host-agent-recoverable.bootstrap", "jobs.host-agent-recoverable.rescan", "dashboard.handoff", "file-monitor.git-worktree"];
export declare const ALEMBIC_RESIDENT_API_AI_JOB_FEATURES: readonly ["jobs.api-ai.bootstrap", "jobs.api-ai.rescan"];
export declare const ALEMBIC_RESIDENT_HOST_AGENT_RECOVERABLE_JOB_FEATURES: readonly ["jobs.host-agent-recoverable.bootstrap", "jobs.host-agent-recoverable.rescan"];
export declare const ALEMBIC_RESIDENT_JOB_FEATURES: readonly ["jobs.api-ai.bootstrap", "jobs.api-ai.rescan", "jobs.host-agent-recoverable.bootstrap", "jobs.host-agent-recoverable.rescan"];
export declare const ALEMBIC_RESIDENT_SEARCH_MODES: readonly ["auto", "keyword", "semantic"];
export declare const ALEMBIC_RESIDENT_SEARCH_RESULT_MODES: readonly ["keyword", "semantic", "hybrid", "baseline"];
export type AlembicResidentRouteKind = AlembicRuntimeRouteKind;
export type AlembicResidentServiceOwner = (typeof ALEMBIC_RESIDENT_SERVICE_OWNERS)[number];
export type AlembicResidentServiceScopeKind = (typeof ALEMBIC_RESIDENT_SERVICE_SCOPE_KINDS)[number];
export type AlembicResidentServiceUnavailableReason = (typeof ALEMBIC_RESIDENT_SERVICE_UNAVAILABLE_REASONS)[number];
export type AlembicResidentFeature = (typeof ALEMBIC_RESIDENT_FEATURES)[number];
export type AlembicResidentApiAiJobFeature = (typeof ALEMBIC_RESIDENT_API_AI_JOB_FEATURES)[number];
export type AlembicResidentHostAgentRecoverableJobFeature = (typeof ALEMBIC_RESIDENT_HOST_AGENT_RECOVERABLE_JOB_FEATURES)[number];
export type AlembicResidentJobFeature = (typeof ALEMBIC_RESIDENT_JOB_FEATURES)[number];
export type AlembicResidentJobFamily = 'api-ai' | 'host-agent-recoverable';
export type AlembicResidentJobOperation = 'bootstrap' | 'rescan';
export type AlembicResidentSearchMode = (typeof ALEMBIC_RESIDENT_SEARCH_MODES)[number];
export type AlembicResidentSearchResultMode = (typeof ALEMBIC_RESIDENT_SEARCH_RESULT_MODES)[number];
export type AlembicResidentProjectIdentitySummary = Pick<AlembicRuntimeProjectIdentitySummary, 'dataRootSource' | 'projectId' | 'projectScope' | 'projectScopeId' | 'schemaMigrationVersion' | 'workspaceMode'>;
export interface AlembicResidentDiagnosticPaths {
    controlRoot: string | null;
    databasePath: string | null;
    dataRoot: string | null;
    projectRoot: string | null;
    runtimeDir: string | null;
    statePath: string | null;
}
export interface AlembicResidentServiceScopeSummary {
    diagnosticPaths: AlembicResidentDiagnosticPaths;
    displayName: string | null;
    kind: AlembicResidentServiceScopeKind;
    projectIdentity: AlembicResidentProjectIdentitySummary;
    scopeId: string | null;
}
export interface AlembicResidentFeatureCapability {
    available: boolean;
    feature: AlembicResidentFeature;
    message: string | null;
    owner: AlembicResidentServiceOwner;
    route: AlembicResidentRouteKind;
    unavailableReason: AlembicResidentServiceUnavailableReason | null;
}
export type AlembicResidentCapabilities = Record<AlembicResidentFeature, AlembicResidentFeatureCapability>;
export type AlembicResidentCapabilityOverrides = Partial<Record<AlembicResidentFeature, Partial<Omit<AlembicResidentFeatureCapability, 'feature'>>>>;
export interface CreateAlembicResidentCapabilitiesOptions {
    defaultAvailable?: boolean;
    overrides?: AlembicResidentCapabilityOverrides;
    owner?: AlembicResidentServiceOwner;
    route?: AlembicResidentRouteKind;
    unavailableReason?: AlembicResidentServiceUnavailableReason;
}
export interface CreateAlembicResidentServiceStatusOptions {
    apiBaseUrl?: string | null;
    capabilityOverrides?: AlembicResidentCapabilityOverrides;
    defaultCapabilityAvailable?: boolean;
    healthPath?: string | null;
    message?: string | null;
    owner?: AlembicResidentServiceOwner;
    route?: AlembicResidentRouteKind;
    serviceScope?: unknown;
}
export interface AlembicResidentServiceStatus {
    apiBaseUrl: string | null;
    capabilities: AlembicResidentCapabilities;
    contractVersion: typeof ALEMBIC_RESIDENT_SERVICE_CONTRACT_VERSION;
    healthPath: string;
    message: string | null;
    owner: AlembicResidentServiceOwner;
    route: AlembicResidentRouteKind;
    serviceScope: AlembicResidentServiceScopeSummary;
}
export interface AlembicResidentServiceStatusSummary {
    availableFeatures: AlembicResidentFeature[];
    contractVersion: typeof ALEMBIC_RESIDENT_SERVICE_CONTRACT_VERSION;
    owner: AlembicResidentServiceOwner;
    route: AlembicResidentRouteKind;
    serviceScope: AlembicResidentServiceScopeSummary;
    unavailableFeatures: AlembicResidentFeature[];
    unavailableReasons: Partial<Record<AlembicResidentFeature, AlembicResidentServiceUnavailableReason>>;
}
export interface AlembicResidentServiceProbe {
    checkedAt: string;
    status: AlembicResidentServiceStatus;
    summary: AlembicResidentServiceStatusSummary;
}
export type AlembicResidentServiceResult<TValue> = {
    ok: true;
    owner: AlembicResidentServiceOwner;
    route: AlembicResidentRouteKind;
    status?: AlembicResidentServiceStatus;
    telemetry?: Record<string, unknown>;
    value: TValue;
} | {
    errorCode?: string;
    message: string;
    ok: false;
    owner: AlembicResidentServiceOwner;
    reason: AlembicResidentServiceUnavailableReason;
    retryable: boolean;
    route: AlembicResidentRouteKind;
    status?: AlembicResidentServiceStatus;
    telemetry?: Record<string, unknown>;
};
export interface AlembicResidentSearchRequest {
    diagnosticProjectRoot?: string | null;
    limit?: number;
    mode?: AlembicResidentSearchMode;
    query: string;
    serviceScopeId?: string | null;
    traceId?: string;
}
export interface AlembicResidentSearchResultItem {
    id: string;
    kind: string | null;
    metadata?: Record<string, unknown>;
    score: number | null;
    source: string | null;
    title: string | null;
}
export interface AlembicResidentSearchResponse {
    degradedReason: string | null;
    mode: AlembicResidentSearchResultMode;
    results: AlembicResidentSearchResultItem[];
    telemetry?: Record<string, unknown>;
}
export interface AlembicResidentJobRequest {
    diagnosticProjectRoot?: string | null;
    feature: AlembicResidentJobFeature;
    force?: boolean;
    reason?: string | null;
    serviceScopeId?: string | null;
    traceId?: string;
}
export interface AlembicResidentJobResponse {
    feature: AlembicResidentJobFeature;
    jobId: string;
    owner: AlembicResidentServiceOwner;
    route: AlembicResidentRouteKind;
    status: DaemonJobStatus;
}
export type AlembicResidentJobSubmitRequest = AlembicResidentJobRequest;
export type AlembicResidentJobSubmitResponse = AlembicResidentJobResponse;
export interface AlembicResidentJobListRequest {
    feature?: AlembicResidentJobFeature;
    limit?: number;
    status?: DaemonJobStatus;
}
export type AlembicResidentJobReadRequest = AlembicResidentJobListRequest;
export type AlembicResidentJobReadResponse = AlembicResidentJobResponse | AlembicResidentJobResponse[];
export interface AlembicResidentDashboardHandoffRequest {
    diagnosticProjectRoot?: string | null;
    serviceScopeId?: string | null;
    traceId?: string;
}
export interface AlembicResidentDashboardHandoffResponse {
    available: boolean;
    message: string | null;
    owner: AlembicResidentServiceOwner;
    route: AlembicResidentRouteKind;
    unavailableReason: AlembicResidentServiceUnavailableReason | null;
    url: string | null;
}
export type AlembicResidentDashboardHandoff = AlembicResidentDashboardHandoffResponse;
export declare function createAlembicResidentFeatureCapability(feature: AlembicResidentFeature, options?: Partial<Omit<AlembicResidentFeatureCapability, 'feature'>>): AlembicResidentFeatureCapability;
export declare function createAlembicResidentCapabilities(options?: CreateAlembicResidentCapabilitiesOptions): AlembicResidentCapabilities;
export declare function createAlembicResidentServiceStatus(options?: CreateAlembicResidentServiceStatusOptions): AlembicResidentServiceStatus;
export declare function normalizeAlembicResidentServiceStatus(value: unknown): AlembicResidentServiceStatus;
export declare function normalizeAlembicResidentCapabilities(value: unknown, route?: AlembicResidentRouteKind, owner?: AlembicResidentServiceOwner): AlembicResidentCapabilities;
export declare function normalizeAlembicResidentServiceScopeSummary(value: unknown): AlembicResidentServiceScopeSummary;
export declare function normalizeAlembicResidentDiagnosticPaths(value: unknown): AlembicResidentDiagnosticPaths;
export declare function summarizeAlembicResidentServiceStatus(status: AlembicResidentServiceStatus): AlembicResidentServiceStatusSummary;
export declare function createAlembicResidentServiceProbe(status: AlembicResidentServiceStatus, checkedAt: string): AlembicResidentServiceProbe;
export declare function createAlembicResidentServiceSuccess<TValue>(value: TValue, status: AlembicResidentServiceStatus, telemetry?: Record<string, unknown>): AlembicResidentServiceResult<TValue>;
export declare function createAlembicResidentServiceUnavailable<TValue>(status: AlembicResidentServiceStatus, reason: AlembicResidentServiceUnavailableReason, message: string, options?: {
    errorCode?: string;
    retryable?: boolean;
    telemetry?: Record<string, unknown>;
}): AlembicResidentServiceResult<TValue>;
export declare function classifyAlembicResidentJobFeature(feature: unknown): AlembicResidentJobFamily | null;
export declare function getAlembicResidentJobOperation(feature: AlembicResidentJobFeature): AlembicResidentJobOperation;
export declare function resolveAlembicResidentRouteOwner(route: AlembicResidentRouteKind): AlembicResidentServiceOwner;
export declare function resolveAlembicResidentFeatureOwner(feature: AlembicResidentFeature, route?: AlembicResidentRouteKind, fallbackOwner?: AlembicResidentServiceOwner): AlembicResidentServiceOwner;
export declare function isAlembicResidentRouteKind(value: unknown): value is AlembicResidentRouteKind;
export declare function normalizeAlembicResidentRouteKind(value: unknown): AlembicResidentRouteKind | null;
export declare function isAlembicResidentServiceOwner(value: unknown): value is AlembicResidentServiceOwner;
export declare function normalizeAlembicResidentServiceOwner(value: unknown): AlembicResidentServiceOwner | null;
export declare function isAlembicResidentServiceScopeKind(value: unknown): value is AlembicResidentServiceScopeKind;
export declare function normalizeAlembicResidentServiceScopeKind(value: unknown): AlembicResidentServiceScopeKind | null;
export declare function isAlembicResidentServiceUnavailableReason(value: unknown): value is AlembicResidentServiceUnavailableReason;
export declare function normalizeAlembicResidentServiceUnavailableReason(value: unknown): AlembicResidentServiceUnavailableReason | null;
export declare function isAlembicResidentFeature(value: unknown): value is AlembicResidentFeature;
export declare function normalizeAlembicResidentFeature(value: unknown): AlembicResidentFeature | null;
export declare function isAlembicResidentJobFeature(value: unknown): value is AlembicResidentJobFeature;
export declare function isAlembicResidentApiAiJobFeature(value: unknown): value is AlembicResidentApiAiJobFeature;
export declare function isAlembicResidentHostAgentRecoverableJobFeature(value: unknown): value is AlembicResidentHostAgentRecoverableJobFeature;
