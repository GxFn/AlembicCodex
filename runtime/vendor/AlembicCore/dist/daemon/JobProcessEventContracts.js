export const JOB_PROCESS_EVENT_CONTRACT_VERSION = 1;
export const ALEMBIC_JOB_PROCESS_EVENTS_PATH = '/api/v1/jobs/:jobId/events';
export const JOB_PROCESS_EVENT_KINDS = [
    'workflow',
    'llm.input',
    'llm.reflection',
    'llm.output',
    'tool',
    'artifact',
    'checkpoint',
    'error',
    'summary',
];
export const JOB_PROCESS_EVENT_SOURCE_CLASSES = [
    'developer-facing',
    'machine-only',
    'raw-provider',
    'secret',
    'hidden-reasoning',
];
export const JOB_PROCESS_EVENT_DISPLAY_POLICIES = ['full', 'summary-only', 'hidden'];
export const JOB_PROCESS_EVENT_RETENTION_POLICIES = [
    'transient',
    'job-retained',
    'artifact-retained',
];
export const JOB_PROCESS_EVENT_SEVERITIES = ['info', 'success', 'warning', 'error'];
export const JOB_PROCESS_EVENT_MESSAGE_ROLES = [
    'system',
    'developer',
    'user',
    'assistant',
    'tool',
];
export function createJobProcessEvent(input) {
    const sourceClass = input.sourceClass ?? 'developer-facing';
    const displayPolicy = input.displayPolicy ?? defaultDisplayPolicyForSourceClass(sourceClass);
    return {
        artifactRefs: normalizeJobProcessEventArtifactRefs(input.artifactRefs),
        content: input.content ?? null,
        contractVersion: JOB_PROCESS_EVENT_CONTRACT_VERSION,
        correlationId: input.correlationId ?? null,
        createdAt: input.createdAt,
        dimensionId: input.dimensionId ?? null,
        displayPolicy,
        id: input.id,
        jobId: input.jobId,
        kind: input.kind,
        metadata: input.metadata ?? {},
        parentEventId: input.parentEventId ?? null,
        phase: input.phase ?? null,
        retention: input.retention ?? defaultRetentionForSourceClass(sourceClass),
        sequence: input.sequence,
        severity: input.severity ?? defaultSeverityForKind(input.kind),
        sourceClass,
        summary: input.summary ?? null,
        targetName: input.targetName ?? null,
        title: input.title,
    };
}
export function normalizeJobProcessEvent(value) {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    const kind = normalizeJobProcessEventKind(record.kind);
    const id = nonEmptyString(record.id);
    const jobId = nonEmptyString(record.jobId);
    const sequence = numberOrNull(record.sequence);
    const createdAt = nonEmptyString(record.createdAt);
    const title = nonEmptyString(record.title);
    if (!kind || !id || !jobId || sequence === null || !createdAt || !title) {
        return null;
    }
    return createJobProcessEvent({
        artifactRefs: normalizeJobProcessEventArtifactRefs(record.artifactRefs),
        content: normalizeJobProcessEventContent(record.content),
        correlationId: nullableString(record.correlationId),
        createdAt,
        dimensionId: nullableString(record.dimensionId),
        displayPolicy: normalizeJobProcessEventDisplayPolicy(record.displayPolicy) ?? undefined,
        id,
        jobId,
        kind,
        metadata: asRecord(record.metadata) ?? {},
        // 返工后统一对外输出 parentEventId；这里仅兼容验收前写入的 parentId 输入。
        parentEventId: nullableString(record.parentEventId) ?? nullableString(record.parentId),
        phase: nullableString(record.phase),
        retention: normalizeJobProcessEventRetentionPolicy(record.retention) ?? undefined,
        sequence,
        severity: normalizeJobProcessEventSeverity(record.severity) ?? undefined,
        sourceClass: normalizeJobProcessEventSourceClass(record.sourceClass) ?? undefined,
        summary: nullableString(record.summary),
        targetName: nullableString(record.targetName),
        title,
    });
}
export function createJobProcessDeveloperView(event) {
    if (!isJobProcessEventDeveloperVisible(event)) {
        return null;
    }
    const displayPolicy = event.displayPolicy === 'summary-only' ? 'summary-only' : 'full';
    return {
        artifactRefs: event.artifactRefs.map((artifactRef) => ({ ...artifactRef })),
        content: displayPolicy === 'summary-only' ? null : event.content,
        createdAt: event.createdAt,
        dimensionId: event.dimensionId,
        displayPolicy,
        eventId: event.id,
        jobId: event.jobId,
        kind: event.kind,
        metadata: { ...event.metadata },
        parentEventId: event.parentEventId,
        phase: event.phase,
        sequence: event.sequence,
        severity: event.severity,
        summary: event.summary,
        targetName: event.targetName,
        title: event.title,
    };
}
export function createJobProcessEventEndpointCapability(options = {}) {
    return {
        available: options.available ?? false,
        contractVersion: JOB_PROCESS_EVENT_CONTRACT_VERSION,
        defaultRetention: options.defaultRetention ?? 'job-retained',
        developerFacingDefaultDisplayPolicy: 'full',
        endpoint: options.endpoint === undefined ? ALEMBIC_JOB_PROCESS_EVENTS_PATH : options.endpoint,
        supportedDisplayPolicies: [
            ...(options.supportedDisplayPolicies ?? JOB_PROCESS_EVENT_DISPLAY_POLICIES),
        ],
        supportedKinds: [...(options.supportedKinds ?? JOB_PROCESS_EVENT_KINDS)],
        supportedRetentionPolicies: [
            ...(options.supportedRetentionPolicies ?? JOB_PROCESS_EVENT_RETENTION_POLICIES),
        ],
        supportedSourceClasses: [
            ...(options.supportedSourceClasses ?? JOB_PROCESS_EVENT_SOURCE_CLASSES),
        ],
    };
}
export function isJobProcessEventDeveloperVisible(event) {
    // developer-facing 内容第一版默认完整展示；其它 sourceClass 不进入开发者前端。
    return event.sourceClass === 'developer-facing' && event.displayPolicy !== 'hidden';
}
export function defaultDisplayPolicyForSourceClass(sourceClass) {
    return sourceClass === 'developer-facing' ? 'full' : 'hidden';
}
export function defaultRetentionForSourceClass(sourceClass) {
    return sourceClass === 'secret' ||
        sourceClass === 'raw-provider' ||
        sourceClass === 'hidden-reasoning'
        ? 'transient'
        : 'job-retained';
}
export function defaultSeverityForKind(kind) {
    return kind === 'error' ? 'error' : 'info';
}
export function isJobProcessEventKind(value) {
    return typeof value === 'string' && JOB_PROCESS_EVENT_KINDS.includes(value);
}
export function normalizeJobProcessEventKind(value) {
    return isJobProcessEventKind(value) ? value : null;
}
export function isJobProcessEventSourceClass(value) {
    return typeof value === 'string' && JOB_PROCESS_EVENT_SOURCE_CLASSES.includes(value);
}
export function normalizeJobProcessEventSourceClass(value) {
    return isJobProcessEventSourceClass(value) ? value : null;
}
export function isJobProcessEventDisplayPolicy(value) {
    return typeof value === 'string' && JOB_PROCESS_EVENT_DISPLAY_POLICIES.includes(value);
}
export function normalizeJobProcessEventDisplayPolicy(value) {
    return isJobProcessEventDisplayPolicy(value) ? value : null;
}
export function isJobProcessEventRetentionPolicy(value) {
    return typeof value === 'string' && JOB_PROCESS_EVENT_RETENTION_POLICIES.includes(value);
}
export function normalizeJobProcessEventRetentionPolicy(value) {
    return isJobProcessEventRetentionPolicy(value) ? value : null;
}
export function isJobProcessEventSeverity(value) {
    return typeof value === 'string' && JOB_PROCESS_EVENT_SEVERITIES.includes(value);
}
export function normalizeJobProcessEventSeverity(value) {
    return isJobProcessEventSeverity(value) ? value : null;
}
export function isJobProcessEventMessageRole(value) {
    return typeof value === 'string' && JOB_PROCESS_EVENT_MESSAGE_ROLES.includes(value);
}
export function normalizeJobProcessEventMessageRole(value) {
    return isJobProcessEventMessageRole(value) ? value : null;
}
function normalizeJobProcessEventContent(value) {
    const content = asRecord(value);
    if (!content) {
        return null;
    }
    return {
        data: content.data,
        language: nullableString(content.language),
        mimeType: nullableString(content.mimeType),
        role: normalizeJobProcessEventMessageRole(content.role),
        text: nullableString(content.text),
    };
}
function normalizeJobProcessEventArtifactRefs(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) => normalizeJobProcessEventArtifactRef(item))
        .filter((item) => item !== null);
}
function normalizeJobProcessEventArtifactRef(value) {
    const directRef = nonEmptyString(value);
    if (directRef) {
        return {
            kind: 'artifact',
            label: null,
            mimeType: null,
            ref: directRef,
        };
    }
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    const ref = nonEmptyString(record.ref) ?? nonEmptyString(record.path) ?? nonEmptyString(record.url);
    if (!ref) {
        return null;
    }
    return {
        kind: nonEmptyString(record.kind) ?? 'artifact',
        label: nullableString(record.label),
        mimeType: nullableString(record.mimeType),
        ref,
    };
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function nonEmptyString(value) {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
function nullableString(value) {
    return typeof value === 'string' ? value : null;
}
function numberOrNull(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
