import { createHash } from 'node:crypto';
import { createJobProcessDeveloperView, } from './JobProcessEventContracts.js';
export const JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION = 1;
export const ALEMBIC_JOB_DISPLAY_SNAPSHOT_PATH = '/api/v1/jobs/:jobId/display-snapshot';
export const JOB_DISPLAY_SNAPSHOT_CHECKSUM_ALGORITHMS = ['sha256'];
export const JOB_DISPLAY_SNAPSHOT_SECTIONS = [
    'summary',
    'timeline',
    'events',
    'artifacts',
    'llm-io',
    'findings',
    'candidates',
    'source-refs',
    'warnings',
];
export const JOB_DISPLAY_SNAPSHOT_ARTIFACT_STORAGE_KINDS = [
    'job-artifact',
    'snapshot-file',
    'bootstrap-report',
    'external-ref',
];
export const JOB_DISPLAY_SNAPSHOT_TEXT_REDACTION_STATES = [
    'not-redacted',
    'redacted',
    'partially-redacted',
    'unknown',
];
export const JOB_DISPLAY_SNAPSHOT_EVIDENCE_INCOMPLETE_REASONS = [
    'events_missing_after_restart',
    'artifact_missing',
    'artifact_unreadable',
    'snapshot_truncated',
    'snapshot_redacted',
    'report_missing',
    'final_session_missing',
    'llm_io_missing',
    'llm_io_truncated',
    'checksum_mismatch',
    'producer_error',
];
export function createJobDisplaySnapshot(input) {
    const events = input.events?.map((event) => ({ ...event })) ?? [];
    const developerViews = input.developerViews?.map((view) => copyJobProcessDeveloperView(view)) ??
        events
            .map((event) => createJobProcessDeveloperView(event))
            .filter((view) => view !== null);
    const llmIoEntries = input.llmIo?.entries?.map((entry) => copyLlmIoEntry(entry)) ??
        collectJobDisplaySnapshotLlmIoEntries(events);
    const artifacts = input.artifacts?.map((artifact) => ({ ...artifact })) ?? [];
    const evidenceIncomplete = input.evidenceIncomplete?.map((evidence) => ({ ...evidence })) ?? [];
    const llmIoEvidenceIncomplete = input.llmIo?.evidenceIncomplete?.map((evidence) => ({ ...evidence })) ?? [];
    const base = {
        artifacts,
        candidates: copyEvidenceItems(input.candidates),
        contractVersion: JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION,
        developerViews,
        events,
        evidenceIncomplete,
        findings: copyEvidenceItems(input.findings),
        job: { ...input.job },
        llmIo: {
            entries: llmIoEntries,
            evidenceIncomplete: llmIoEvidenceIncomplete,
        },
        manifest: {
            artifactCount: artifacts.length,
            developerViewCount: developerViews.length,
            eventCount: events.length,
            llmIoEntryCount: llmIoEntries.length,
            retainedArtifactCount: artifacts.filter((artifact) => artifact.retained).length,
            warningCount: input.warnings?.length ?? 0,
        },
        phaseTimeline: input.phaseTimeline?.map((item) => ({ ...item, eventIds: [...item.eventIds] })) ?? [],
        producer: {
            contractVersion: JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION,
            ...input.producer,
            modules: [...input.producer.modules],
        },
        snapshot: {
            checksum: input.snapshot.checksum ?? null,
            checksumAlgorithm: input.snapshot.checksumAlgorithm ?? 'sha256',
            createdAt: input.snapshot.createdAt,
            jobId: input.snapshot.jobId,
            ref: input.snapshot.ref,
            snapshotId: input.snapshot.snapshotId,
            snapshotVersion: input.snapshot.snapshotVersion,
            sourceJobUpdatedAt: input.snapshot.sourceJobUpdatedAt,
            updatedAt: input.snapshot.updatedAt,
        },
        sourceRefs: copyEvidenceItems(input.sourceRefs),
        summary: { ...input.summary },
        warnings: input.warnings?.map((warning) => ({ ...warning })) ?? [],
    };
    return {
        ...base,
        snapshot: {
            ...base.snapshot,
            checksum: input.snapshot.checksum ?? computeJobDisplaySnapshotChecksum(base),
        },
    };
}
export function createJobDisplaySnapshotArtifactRef(input) {
    return {
        checksum: input.checksum ?? null,
        kind: input.kind,
        label: input.label ?? null,
        mimeType: input.mimeType ?? null,
        originalChars: input.originalChars ?? null,
        redactionState: input.redactionState ?? 'unknown',
        ref: input.ref,
        retained: input.retained ?? true,
        retainedChars: input.retainedChars ?? null,
        storageKind: input.storageKind ?? 'job-artifact',
        truncated: input.truncated ?? false,
    };
}
export function createJobDisplaySnapshotEvidenceIncomplete(input) {
    return {
        artifactRef: input.artifactRef ?? null,
        createdAt: input.createdAt ?? null,
        eventId: input.eventId ?? null,
        message: input.message,
        reason: input.reason,
        section: input.section,
        severity: input.severity ?? 'warning',
    };
}
export function collectJobDisplaySnapshotLlmIoEntries(events) {
    return events
        .filter((event) => isJobDisplaySnapshotLlmIoKind(event.kind))
        .map((event) => ({
        artifactRefs: event.artifactRefs.map((artifactRef) => createJobDisplaySnapshotArtifactRef(artifactRef)),
        content: event.content ? { ...event.content } : null,
        eventId: event.id,
        kind: event.kind,
        metadata: { ...event.metadata },
        phase: event.phase,
        redaction: createTextBoundaryFromMetadata(event.metadata, 'redaction'),
        sequence: event.sequence,
        summary: event.summary,
        title: event.title,
        truncation: createTextBoundaryFromMetadata(event.metadata, 'truncation'),
    }));
}
export function computeJobDisplaySnapshotChecksum(snapshot) {
    const payload = {
        ...snapshot,
        snapshot: {
            ...snapshot.snapshot,
            checksum: null,
        },
    };
    return createHash('sha256').update(stableStringify(payload)).digest('hex');
}
export function validateJobDisplaySnapshot(snapshot) {
    const issues = [];
    if (snapshot.contractVersion !== JOB_DISPLAY_SNAPSHOT_CONTRACT_VERSION) {
        issues.push({
            code: 'invalid',
            message: 'JobDisplaySnapshot contractVersion is not supported.',
            path: 'contractVersion',
        });
    }
    if (snapshot.snapshot.jobId !== snapshot.job.id) {
        issues.push({
            code: 'invalid',
            message: 'Snapshot jobId must match job identity id.',
            path: 'snapshot.jobId',
        });
    }
    if (!snapshot.snapshot.ref) {
        issues.push({
            code: 'missing',
            message: 'Snapshot ref is required for restart-safe readback.',
            path: 'snapshot.ref',
        });
    }
    if (!snapshot.snapshot.checksum) {
        issues.push({
            code: 'missing',
            message: 'Snapshot checksum is required for same-snapshot verification.',
            path: 'snapshot.checksum',
        });
    }
    else {
        const expected = computeJobDisplaySnapshotChecksum(snapshot);
        if (snapshot.snapshot.checksum !== expected) {
            issues.push({
                code: 'checksum_mismatch',
                message: 'Snapshot checksum does not match serializable payload.',
                path: 'snapshot.checksum',
            });
        }
    }
    return {
        evidenceIncomplete: [...snapshot.evidenceIncomplete, ...snapshot.llmIo.evidenceIncomplete],
        issues,
        valid: issues.length === 0,
    };
}
export function isJobDisplaySnapshotEvidenceIncompleteReason(value) {
    return (typeof value === 'string' &&
        JOB_DISPLAY_SNAPSHOT_EVIDENCE_INCOMPLETE_REASONS.includes(value));
}
export function normalizeJobDisplaySnapshotEvidenceIncompleteReason(value) {
    return isJobDisplaySnapshotEvidenceIncompleteReason(value) ? value : null;
}
export function isJobDisplaySnapshotLlmIoKind(kind) {
    return kind === 'llm.input' || kind === 'llm.reflection' || kind === 'llm.output';
}
function copyJobProcessDeveloperView(view) {
    return {
        ...view,
        artifactRefs: view.artifactRefs.map((artifactRef) => ({ ...artifactRef })),
        content: view.content ? { ...view.content } : null,
        metadata: { ...view.metadata },
    };
}
function copyLlmIoEntry(entry) {
    return {
        ...entry,
        artifactRefs: entry.artifactRefs.map((artifactRef) => ({ ...artifactRef })),
        content: entry.content ? { ...entry.content } : null,
        metadata: { ...entry.metadata },
        redaction: { ...entry.redaction },
        truncation: { ...entry.truncation },
    };
}
function copyEvidenceItems(items) {
    return (items?.map((item) => ({
        ...item,
        artifactRefs: item.artifactRefs.map((artifactRef) => ({ ...artifactRef })),
        metadata: { ...item.metadata },
    })) ?? []);
}
function createTextBoundaryFromMetadata(metadata, prefix) {
    return {
        originalChars: numberOrNull(metadata[`${prefix}OriginalChars`]),
        redactionState: normalizeTextRedactionState(metadata[`${prefix}State`]) ?? 'unknown',
        retainedChars: numberOrNull(metadata[`${prefix}RetainedChars`]),
        truncated: Boolean(metadata[`${prefix}Truncated`]),
    };
}
function normalizeTextRedactionState(value) {
    return typeof value === 'string' &&
        JOB_DISPLAY_SNAPSHOT_TEXT_REDACTION_STATES.includes(value)
        ? value
        : null;
}
function numberOrNull(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function stableStringify(value) {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    const record = value;
    const entries = Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
    return `{${entries.join(',')}}`;
}
