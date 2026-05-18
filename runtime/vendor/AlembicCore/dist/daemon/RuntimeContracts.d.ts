import { type CanonicalFileChangeEventSource } from '../shared/source-contracts.js';
export declare const ALEMBIC_RUNTIME_API_VERSION = "v1";
export declare const ALEMBIC_RUNTIME_PACKAGE_NAME = "alembic-ai";
export declare const ALEMBIC_RUNTIME_HEALTH_PATH = "/api/v1/daemon/health";
export declare const ALEMBIC_FILE_CHANGES_PATH = "/api/v1/file-changes";
export declare const ALEMBIC_RUNTIME_ROUTE_KINDS: readonly ["local-alembic-daemon", "embedded-plugin-runtime", "local-alembic-install", "unavailable"];
export declare const ALEMBIC_FILE_MONITOR_MODES: readonly ["daemon-git-worktree", "host-event-bridge", "embedded-runtime-adapter", "disabled"];
export declare const ALEMBIC_JOB_KINDS: readonly ["bootstrap", "rescan"];
export declare const ALEMBIC_JOB_ENDPOINTS: {
    readonly bootstrap: "/api/v1/jobs/bootstrap";
    readonly list: "/api/v1/jobs";
    readonly rescan: "/api/v1/jobs/rescan";
};
export declare const ALEMBIC_FILE_MONITOR_EVENT_SOURCES: readonly ["host-edit", "git-head", "git-worktree"];
export declare const ALEMBIC_FILE_MONITOR_COMPATIBILITY_ALIASES: {
    readonly "ide-edit": "host-edit";
};
export type AlembicRuntimeMode = 'api' | 'daemon';
export type AlembicRuntimeRouteKind = (typeof ALEMBIC_RUNTIME_ROUTE_KINDS)[number];
export type AlembicEnhancementRoute = 'local-alembic';
export type AlembicFileMonitorMode = (typeof ALEMBIC_FILE_MONITOR_MODES)[number];
export type AlembicJobKind = (typeof ALEMBIC_JOB_KINDS)[number];
export type AlembicInternalAiConfigSource = 'empty' | 'process-env' | 'runtime-overrides' | 'workspace-settings';
export interface AlembicRuntimeProjectIdentity {
    dataRoot: string;
    databasePath?: string;
    projectId: string | null;
    projectRoot: string;
    schemaMigrationVersion?: string | null;
}
export interface AlembicRuntimeEnhancementIdentity {
    apiVersion: typeof ALEMBIC_RUNTIME_API_VERSION;
    packageName: string;
    route: AlembicEnhancementRoute;
    version: string;
}
export interface AlembicApiCapability {
    available: boolean;
    baseUrl: string | null;
    healthPath: typeof ALEMBIC_RUNTIME_HEALTH_PATH | string;
}
export interface AlembicDashboardCapability {
    available: boolean;
    url: string | null;
}
export interface AlembicFileMonitorCapability {
    acceptedEventSources: CanonicalFileChangeEventSource[];
    available: boolean;
    compatibilityAliases: Partial<Record<string, CanonicalFileChangeEventSource>>;
    endpoint: typeof ALEMBIC_FILE_CHANGES_PATH | string | null;
    mode: AlembicFileMonitorMode;
}
export interface AlembicInternalAiCapability {
    available: boolean;
    configSource: AlembicInternalAiConfigSource;
    model: string | null;
    provider: string | null;
}
export interface AlembicJobsCapability {
    available: boolean;
    endpoints: {
        bootstrap?: string;
        list?: string;
        rescan?: string;
    };
    kinds: AlembicJobKind[];
}
export interface AlembicRuntimeCapabilities {
    api: AlembicApiCapability;
    dashboard: AlembicDashboardCapability;
    fileMonitor: AlembicFileMonitorCapability;
    internalAi: AlembicInternalAiCapability;
    jobs: AlembicJobsCapability;
}
export interface AlembicRuntimeHealthData extends AlembicRuntimeProjectIdentity {
    capabilities: AlembicRuntimeCapabilities;
    dashboardUrl: string | null;
    enhancement: AlembicRuntimeEnhancementIdentity;
    mode: AlembicRuntimeMode;
    pid?: number;
    uptime?: number;
    version: string;
}
export interface CreateAlembicRuntimeCapabilitiesOptions {
    apiAvailable?: boolean;
    apiBaseUrl: string | null;
    dashboardAvailable: boolean;
    dashboardUrl: string | null;
    fileMonitorAvailable?: boolean;
    fileMonitorEndpoint?: string | null;
    fileMonitorMode?: AlembicFileMonitorMode;
    internalAi: AlembicInternalAiCapability;
    jobEndpoints?: Partial<Record<keyof typeof ALEMBIC_JOB_ENDPOINTS, string>>;
    jobKinds?: readonly AlembicJobKind[];
    jobsAvailable?: boolean;
}
export interface CreateAlembicRuntimeHealthDataOptions extends AlembicRuntimeProjectIdentity {
    capabilities: AlembicRuntimeCapabilities;
    dashboardUrl?: string | null;
    enhancement?: Partial<AlembicRuntimeEnhancementIdentity>;
    mode: AlembicRuntimeMode;
    pid?: number;
    uptime?: number;
    version: string;
}
export interface AlembicRuntimeCapabilitySummary {
    apiAvailable: boolean | null;
    dashboardAvailable: boolean | null;
    dashboardUrl: string | null;
    fileMonitorAvailable: boolean | null;
    fileMonitorMode: AlembicFileMonitorMode | null;
    internalAiAvailable: boolean | null;
    jobsAvailable: boolean | null;
    jobKinds: string[];
}
export declare function createAlembicRuntimeCapabilities(options: CreateAlembicRuntimeCapabilitiesOptions): AlembicRuntimeCapabilities;
export declare function createAlembicRuntimeHealthData(options: CreateAlembicRuntimeHealthDataOptions): AlembicRuntimeHealthData;
export declare function createAlembicRuntimeEnhancementIdentity(input: {
    apiVersion?: typeof ALEMBIC_RUNTIME_API_VERSION;
    packageName?: string;
    route?: AlembicEnhancementRoute;
    version: string;
}): AlembicRuntimeEnhancementIdentity;
export declare function summarizeAlembicRuntimeCapabilities(value: unknown): AlembicRuntimeCapabilitySummary;
export declare function isAlembicRuntimeRouteKind(value: unknown): value is AlembicRuntimeRouteKind;
export declare function normalizeAlembicRuntimeRouteKind(value: unknown): AlembicRuntimeRouteKind | null;
export declare function isAlembicFileMonitorMode(value: unknown): value is AlembicFileMonitorMode;
export declare function normalizeAlembicFileMonitorMode(value: unknown): AlembicFileMonitorMode | null;
