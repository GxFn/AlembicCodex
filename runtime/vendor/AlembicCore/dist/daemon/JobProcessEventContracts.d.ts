export declare const JOB_PROCESS_EVENT_CONTRACT_VERSION = 1;
export declare const ALEMBIC_JOB_PROCESS_EVENTS_PATH = "/api/v1/jobs/:jobId/events";
export declare const JOB_PROCESS_EVENT_KINDS: readonly ["workflow", "llm.input", "llm.reflection", "llm.output", "tool", "artifact", "checkpoint", "error", "summary"];
export declare const JOB_PROCESS_EVENT_SOURCE_CLASSES: readonly ["developer-facing", "machine-only", "raw-provider", "secret", "hidden-reasoning"];
export declare const JOB_PROCESS_EVENT_DISPLAY_POLICIES: readonly ["full", "summary-only", "hidden"];
export declare const JOB_PROCESS_EVENT_RETENTION_POLICIES: readonly ["transient", "job-retained", "artifact-retained"];
export declare const JOB_PROCESS_EVENT_SEVERITIES: readonly ["info", "success", "warning", "error"];
export declare const JOB_PROCESS_EVENT_MESSAGE_ROLES: readonly ["system", "developer", "user", "assistant", "tool"];
export type JobProcessEventKind = (typeof JOB_PROCESS_EVENT_KINDS)[number];
export type JobProcessEventSourceClass = (typeof JOB_PROCESS_EVENT_SOURCE_CLASSES)[number];
export type JobProcessEventDisplayPolicy = (typeof JOB_PROCESS_EVENT_DISPLAY_POLICIES)[number];
export type JobProcessEventRetentionPolicy = (typeof JOB_PROCESS_EVENT_RETENTION_POLICIES)[number];
export type JobProcessEventSeverity = (typeof JOB_PROCESS_EVENT_SEVERITIES)[number];
export type JobProcessEventMessageRole = (typeof JOB_PROCESS_EVENT_MESSAGE_ROLES)[number];
export interface JobProcessEventContent {
    data?: unknown;
    language?: string | null;
    mimeType?: string | null;
    role?: JobProcessEventMessageRole | null;
    text: string | null;
}
export interface JobProcessEventArtifactRef {
    kind: string;
    label: string | null;
    mimeType: string | null;
    ref: string;
}
export interface JobProcessEvent {
    artifactRefs: JobProcessEventArtifactRef[];
    content: JobProcessEventContent | null;
    contractVersion: typeof JOB_PROCESS_EVENT_CONTRACT_VERSION;
    correlationId: string | null;
    createdAt: string;
    dimensionId: string | null;
    displayPolicy: JobProcessEventDisplayPolicy;
    id: string;
    jobId: string;
    kind: JobProcessEventKind;
    metadata: Record<string, unknown>;
    parentEventId: string | null;
    phase: string | null;
    retention: JobProcessEventRetentionPolicy;
    sequence: number;
    severity: JobProcessEventSeverity;
    sourceClass: JobProcessEventSourceClass;
    summary: string | null;
    targetName: string | null;
    title: string;
}
export interface JobProcessDeveloperView {
    artifactRefs: JobProcessEventArtifactRef[];
    content: JobProcessEventContent | null;
    createdAt: string;
    dimensionId: string | null;
    displayPolicy: Exclude<JobProcessEventDisplayPolicy, 'hidden'>;
    eventId: string;
    jobId: string;
    kind: JobProcessEventKind;
    metadata: Record<string, unknown>;
    parentEventId: string | null;
    phase: string | null;
    sequence: number;
    severity: JobProcessEventSeverity;
    summary: string | null;
    targetName: string | null;
    title: string;
}
export interface CreateJobProcessEventInput {
    artifactRefs?: readonly JobProcessEventArtifactRef[];
    content?: JobProcessEventContent | null;
    correlationId?: string | null;
    createdAt: string;
    dimensionId?: string | null;
    displayPolicy?: JobProcessEventDisplayPolicy;
    id: string;
    jobId: string;
    kind: JobProcessEventKind;
    metadata?: Record<string, unknown>;
    parentEventId?: string | null;
    phase?: string | null;
    retention?: JobProcessEventRetentionPolicy;
    sequence: number;
    severity?: JobProcessEventSeverity;
    sourceClass?: JobProcessEventSourceClass;
    summary?: string | null;
    targetName?: string | null;
    title: string;
}
export interface JobProcessEventEndpointCapability {
    available: boolean;
    contractVersion: typeof JOB_PROCESS_EVENT_CONTRACT_VERSION;
    defaultRetention: JobProcessEventRetentionPolicy;
    developerFacingDefaultDisplayPolicy: 'full';
    endpoint: string | null;
    supportedDisplayPolicies: JobProcessEventDisplayPolicy[];
    supportedKinds: JobProcessEventKind[];
    supportedRetentionPolicies: JobProcessEventRetentionPolicy[];
    supportedSourceClasses: JobProcessEventSourceClass[];
}
export interface CreateJobProcessEventEndpointCapabilityOptions {
    available?: boolean;
    defaultRetention?: JobProcessEventRetentionPolicy;
    endpoint?: string | null;
    supportedDisplayPolicies?: readonly JobProcessEventDisplayPolicy[];
    supportedKinds?: readonly JobProcessEventKind[];
    supportedRetentionPolicies?: readonly JobProcessEventRetentionPolicy[];
    supportedSourceClasses?: readonly JobProcessEventSourceClass[];
}
export declare function createJobProcessEvent(input: CreateJobProcessEventInput): JobProcessEvent;
export declare function normalizeJobProcessEvent(value: unknown): JobProcessEvent | null;
export declare function createJobProcessDeveloperView(event: JobProcessEvent): JobProcessDeveloperView | null;
export declare function createJobProcessEventEndpointCapability(options?: CreateJobProcessEventEndpointCapabilityOptions): JobProcessEventEndpointCapability;
export declare function isJobProcessEventDeveloperVisible(event: JobProcessEvent): boolean;
export declare function defaultDisplayPolicyForSourceClass(sourceClass: JobProcessEventSourceClass): JobProcessEventDisplayPolicy;
export declare function defaultRetentionForSourceClass(sourceClass: JobProcessEventSourceClass): JobProcessEventRetentionPolicy;
export declare function defaultSeverityForKind(kind: JobProcessEventKind): JobProcessEventSeverity;
export declare function isJobProcessEventKind(value: unknown): value is JobProcessEventKind;
export declare function normalizeJobProcessEventKind(value: unknown): JobProcessEventKind | null;
export declare function isJobProcessEventSourceClass(value: unknown): value is JobProcessEventSourceClass;
export declare function normalizeJobProcessEventSourceClass(value: unknown): JobProcessEventSourceClass | null;
export declare function isJobProcessEventDisplayPolicy(value: unknown): value is JobProcessEventDisplayPolicy;
export declare function normalizeJobProcessEventDisplayPolicy(value: unknown): JobProcessEventDisplayPolicy | null;
export declare function isJobProcessEventRetentionPolicy(value: unknown): value is JobProcessEventRetentionPolicy;
export declare function normalizeJobProcessEventRetentionPolicy(value: unknown): JobProcessEventRetentionPolicy | null;
export declare function isJobProcessEventSeverity(value: unknown): value is JobProcessEventSeverity;
export declare function normalizeJobProcessEventSeverity(value: unknown): JobProcessEventSeverity | null;
export declare function isJobProcessEventMessageRole(value: unknown): value is JobProcessEventMessageRole;
export declare function normalizeJobProcessEventMessageRole(value: unknown): JobProcessEventMessageRole | null;
