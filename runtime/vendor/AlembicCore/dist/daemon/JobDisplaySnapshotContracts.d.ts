import { type JobProcessDeveloperView, type JobProcessEvent, type JobProcessEventArtifactRef, type JobProcessEventContent } from './JobProcessEventContracts.js';
import type { DaemonJobKind, DaemonJobStatus } from './JobStore.js';
export declare const JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION = 1;
export declare const ALEMBIC_JOB_DISPLAY_SNAPSHOT_PATH = "/api/v1/jobs/:jobId/display-snapshot";
export declare const JOB_DISPLAY_SNAPSHOT_CHECKSUM_ALGORITHMS: readonly ["sha256"];
export declare const JOB_DISPLAY_SNAPSHOT_SECTIONS: readonly ["summary", "timeline", "events", "artifacts", "llm-io", "findings", "candidates", "source-refs", "warnings"];
export declare const JOB_DISPLAY_SNAPSHOT_ARTIFACT_STORAGE_KINDS: readonly ["job-artifact", "snapshot-file", "bootstrap-report", "external-ref"];
export declare const JOB_DISPLAY_SNAPSHOT_TEXT_REDACTION_STATES: readonly ["not-redacted", "redacted", "partially-redacted", "unknown"];
export declare const JOB_DISPLAY_SNAPSHOT_EVIDENCE_INCOMPLETE_REASONS: readonly ["events_missing_after_restart", "artifact_missing", "artifact_unreadable", "snapshot_truncated", "snapshot_redacted", "report_missing", "final_session_missing", "llm_io_missing", "llm_io_truncated", "checksum_mismatch", "producer_error"];
export type JobDisplaySnapshotChecksumAlgorithm = (typeof JOB_DISPLAY_SNAPSHOT_CHECKSUM_ALGORITHMS)[number];
export type JobDisplaySnapshotSection = (typeof JOB_DISPLAY_SNAPSHOT_SECTIONS)[number];
export type JobDisplaySnapshotArtifactStorageKind = (typeof JOB_DISPLAY_SNAPSHOT_ARTIFACT_STORAGE_KINDS)[number];
export type JobDisplaySnapshotTextRedactionState = (typeof JOB_DISPLAY_SNAPSHOT_TEXT_REDACTION_STATES)[number];
export type JobDisplaySnapshotEvidenceIncompleteReason = (typeof JOB_DISPLAY_SNAPSHOT_EVIDENCE_INCOMPLETE_REASONS)[number];
export type JobDisplaySnapshotSeverity = 'info' | 'success' | 'warning' | 'error';
export type JobDisplaySnapshotPhaseStatus = DaemonJobStatus | 'pending' | 'unknown';
export type JobDisplaySnapshotLlmIoKind = 'llm.input' | 'llm.reflection' | 'llm.output';
export interface JobDisplaySnapshotRef {
    checksum: string | null;
    checksumAlgorithm: JobDisplaySnapshotChecksumAlgorithm;
    jobId: string;
    ref: string;
    snapshotId: string;
    snapshotVersion: number;
}
export interface JobDisplaySnapshotMetadata extends JobDisplaySnapshotRef {
    createdAt: string;
    sourceJobUpdatedAt: string | null;
    updatedAt: string;
}
export interface JobDisplaySnapshotJobIdentity {
    bootstrapSessionId: string | null;
    completedAt: string | null;
    createdAt: string;
    dataRoot: string | null;
    id: string;
    kind: DaemonJobKind;
    projectId: string | null;
    projectRoot: string | null;
    startedAt: string | null;
    status: DaemonJobStatus;
    updatedAt: string;
}
export interface JobDisplaySnapshotSummary {
    message: string | null;
    phase: string | null;
    progress: number | null;
    statusText: string | null;
    title: string;
}
export interface JobDisplaySnapshotPhaseTimelineItem {
    completedAt: string | null;
    eventIds: string[];
    phase: string;
    startedAt: string | null;
    status: JobDisplaySnapshotPhaseStatus;
    summary: string | null;
    title: string;
}
export interface JobDisplaySnapshotTextBoundary {
    originalChars: number | null;
    redactionState: JobDisplaySnapshotTextRedactionState;
    retainedChars: number | null;
    truncated: boolean;
}
export interface JobDisplaySnapshotArtifactRef extends JobProcessEventArtifactRef {
    checksum: string | null;
    originalChars: number | null;
    redactionState: JobDisplaySnapshotTextRedactionState;
    retained: boolean;
    retainedChars: number | null;
    storageKind: JobDisplaySnapshotArtifactStorageKind;
    truncated: boolean;
}
export interface CreateJobDisplaySnapshotArtifactRefInput extends JobProcessEventArtifactRef {
    checksum?: string | null;
    originalChars?: number | null;
    redactionState?: JobDisplaySnapshotTextRedactionState;
    retained?: boolean;
    retainedChars?: number | null;
    storageKind?: JobDisplaySnapshotArtifactStorageKind;
    truncated?: boolean;
}
export interface JobDisplaySnapshotLlmIoEntry {
    artifactRefs: JobDisplaySnapshotArtifactRef[];
    content: JobProcessEventContent | null;
    eventId: string | null;
    kind: JobDisplaySnapshotLlmIoKind;
    metadata: Record<string, unknown>;
    phase: string | null;
    redaction: JobDisplaySnapshotTextBoundary;
    sequence: number | null;
    summary: string | null;
    title: string;
    truncation: JobDisplaySnapshotTextBoundary;
}
export interface JobDisplaySnapshotLlmIoSection {
    entries: JobDisplaySnapshotLlmIoEntry[];
    evidenceIncomplete: JobDisplaySnapshotEvidenceIncomplete[];
}
export interface JobDisplaySnapshotEvidenceItem {
    artifactRefs: JobDisplaySnapshotArtifactRef[];
    id: string;
    metadata: Record<string, unknown>;
    sourceRef: string | null;
    summary: string | null;
    title: string;
}
export interface JobDisplaySnapshotWarning {
    code: string;
    evidenceIncompleteReason: JobDisplaySnapshotEvidenceIncompleteReason | null;
    message: string;
    section: JobDisplaySnapshotSection | null;
    severity: JobDisplaySnapshotSeverity;
}
export interface JobDisplaySnapshotEvidenceIncomplete {
    artifactRef: string | null;
    createdAt: string | null;
    eventId: string | null;
    message: string;
    reason: JobDisplaySnapshotEvidenceIncompleteReason;
    section: JobDisplaySnapshotSection;
    severity: Exclude<JobDisplaySnapshotSeverity, 'success'>;
}
export interface CreateJobDisplaySnapshotEvidenceIncompleteInput {
    artifactRef?: string | null;
    createdAt?: string | null;
    eventId?: string | null;
    message: string;
    reason: JobDisplaySnapshotEvidenceIncompleteReason;
    section: JobDisplaySnapshotSection;
    severity?: Exclude<JobDisplaySnapshotSeverity, 'success'>;
}
export interface JobDisplaySnapshotManifest {
    artifactCount: number;
    developerViewCount: number;
    eventCount: number;
    llmIoEntryCount: number;
    retainedArtifactCount: number;
    warningCount: number;
}
export interface JobDisplaySnapshotProducerMetadata {
    contractVersion: typeof JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION;
    modules: string[];
    name: 'alembic';
    producedAt: string;
    version: string | null;
}
export interface JobDisplaySnapshot {
    artifacts: JobDisplaySnapshotArtifactRef[];
    candidates: JobDisplaySnapshotEvidenceItem[];
    contractVersion: typeof JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION;
    developerViews: JobProcessDeveloperView[];
    events: JobProcessEvent[];
    evidenceIncomplete: JobDisplaySnapshotEvidenceIncomplete[];
    findings: JobDisplaySnapshotEvidenceItem[];
    job: JobDisplaySnapshotJobIdentity;
    llmIo: JobDisplaySnapshotLlmIoSection;
    manifest: JobDisplaySnapshotManifest;
    phaseTimeline: JobDisplaySnapshotPhaseTimelineItem[];
    producer: JobDisplaySnapshotProducerMetadata;
    snapshot: JobDisplaySnapshotMetadata;
    sourceRefs: JobDisplaySnapshotEvidenceItem[];
    summary: JobDisplaySnapshotSummary;
    warnings: JobDisplaySnapshotWarning[];
}
export interface CreateJobDisplaySnapshotInput {
    artifacts?: readonly JobDisplaySnapshotArtifactRef[];
    candidates?: readonly JobDisplaySnapshotEvidenceItem[];
    developerViews?: readonly JobProcessDeveloperView[];
    events?: readonly JobProcessEvent[];
    evidenceIncomplete?: readonly JobDisplaySnapshotEvidenceIncomplete[];
    findings?: readonly JobDisplaySnapshotEvidenceItem[];
    job: JobDisplaySnapshotJobIdentity;
    llmIo?: Partial<JobDisplaySnapshotLlmIoSection>;
    phaseTimeline?: readonly JobDisplaySnapshotPhaseTimelineItem[];
    producer: Omit<JobDisplaySnapshotProducerMetadata, 'contractVersion'>;
    snapshot: Omit<JobDisplaySnapshotMetadata, 'checksum' | 'checksumAlgorithm'> & {
        checksum?: string | null;
        checksumAlgorithm?: JobDisplaySnapshotChecksumAlgorithm;
    };
    sourceRefs?: readonly JobDisplaySnapshotEvidenceItem[];
    summary: JobDisplaySnapshotSummary;
    warnings?: readonly JobDisplaySnapshotWarning[];
}
export interface JobDisplaySnapshotValidationIssue {
    code: 'missing' | 'invalid' | 'checksum_mismatch';
    message: string;
    path: string;
}
export interface JobDisplaySnapshotValidationResult {
    evidenceIncomplete: JobDisplaySnapshotEvidenceIncomplete[];
    issues: JobDisplaySnapshotValidationIssue[];
    valid: boolean;
}
export declare function createJobDisplaySnapshot(input: CreateJobDisplaySnapshotInput): JobDisplaySnapshot;
export declare function createJobDisplaySnapshotArtifactRef(input: CreateJobDisplaySnapshotArtifactRefInput): JobDisplaySnapshotArtifactRef;
export declare function createJobDisplaySnapshotEvidenceIncomplete(input: CreateJobDisplaySnapshotEvidenceIncompleteInput): JobDisplaySnapshotEvidenceIncomplete;
export declare function collectJobDisplaySnapshotLlmIoEntries(events: readonly JobProcessEvent[]): JobDisplaySnapshotLlmIoEntry[];
export declare function computeJobDisplaySnapshotChecksum(snapshot: JobDisplaySnapshot): string;
export declare function validateJobDisplaySnapshot(snapshot: JobDisplaySnapshot): JobDisplaySnapshotValidationResult;
export declare function isJobDisplaySnapshotEvidenceIncompleteReason(value: unknown): value is JobDisplaySnapshotEvidenceIncompleteReason;
export declare function normalizeJobDisplaySnapshotEvidenceIncompleteReason(value: unknown): JobDisplaySnapshotEvidenceIncompleteReason | null;
export declare function isJobDisplaySnapshotLlmIoKind(kind: unknown): kind is JobDisplaySnapshotLlmIoKind;
