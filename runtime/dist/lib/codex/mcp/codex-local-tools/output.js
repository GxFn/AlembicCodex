import { z } from 'zod';
import { CleanMcpResponseBaseSchema, createCleanMcpError, createCleanMcpResponse, registerMcpOutputProjector, } from '../output-contract.js';
export const CODEX_LOCAL_CLEAN_OUTPUT_TOOL_NAMES = [
    'alembic_codex_status',
    'alembic_codex_diagnostics',
    'alembic_codex_init',
    'alembic_codex_dashboard',
    'alembic_codex_bootstrap',
    'alembic_codex_rescan',
    'alembic_codex_job',
    'alembic_codex_stop',
    'alembic_codex_cleanup',
];
export const CodexLocalCleanOutputToolNameSchema = z.enum(CODEX_LOCAL_CLEAN_OUTPUT_TOOL_NAMES);
export const CODEX_LOCAL_BASE_OUTPUT_FIELD_NAMES = [
    'error',
    'meta',
    'ok',
    'status',
    'summary',
    'toolName',
];
export const CODEX_LOCAL_RUNTIME_DIAGNOSTIC_TOOL_NAMES = [
    'alembic_codex_status',
    'alembic_codex_diagnostics',
    'alembic_codex_job',
    'alembic_codex_cleanup',
];
export const CODEX_LOCAL_FORBIDDEN_TOP_LEVEL_OUTPUT_KEYS = new Set([
    'data',
    'errorCode',
    'message',
    'result',
    'success',
]);
export const CODEX_LOCAL_IMPLICIT_RUNTIME_OUTPUT_KEYS = new Set([
    'diagnostics',
    'enhancementRoute',
    'hostProjectAlignment',
    'projectRuntime',
    'residentService',
    'serviceBoundary',
]);
const CODEX_LOCAL_SENSITIVE_OUTPUT_KEYS = new Set([
    'accesstoken',
    'apikey',
    'authheader',
    'authorization',
    'bearertoken',
    'cookie',
    'internaltelemetry',
    'password',
    'privatedaemonurl',
    'providerprivatetrace',
    'refreshtoken',
    'secret',
    'secrettoken',
    'setcookie',
]);
const RESERVED_TOP_LEVEL_FIELD_RENAMES = {
    data: 'businessData',
    error: 'businessError',
    errorCode: 'businessErrorCode',
    message: 'businessMessage',
    meta: 'businessMeta',
    ok: 'businessOk',
    result: 'businessResult',
    status: 'businessStatus',
    success: 'businessSuccess',
    summary: 'businessSummary',
    toolName: 'businessToolName',
};
const ALLOWED_CLEAN_META_KEYS = new Set(['responseTimeMs', 'source']);
export const CODEX_LOCAL_TOOL_ALLOWED_BUSINESS_FIELD_NAMES = {
    alembic_codex_bootstrap: [
        'job',
        'jobId',
        'jobRoute',
        'nextActions',
        'needsUserInput',
        'reasonCode',
    ],
    alembic_codex_cleanup: ['cleaned', 'dryRun', 'projectRuntime', 'targets'],
    alembic_codex_dashboard: ['dashboardUrl', 'needsUserInput', 'nextActions', 'reasonCode'],
    alembic_codex_diagnostics: [
        'autoInit',
        'businessSummary',
        'businessOk',
        'checks',
        'cleanup',
        'codex',
        'commands',
        'daemon',
        'enhancementRoute',
        'gitDiffCheckpoint',
        'hostProjectAlignment',
        'issues',
        'moduleBoundary',
        'nextActions',
        'node',
        'offlineFallback',
        'package',
        'plugin',
        'primaryAction',
        'projectRootResolution',
        'projectRuntime',
        'projectScopeIdentity',
        'residentService',
        'residentServiceBoundary',
        'runtimeIdentity',
        'summary',
    ],
    alembic_codex_init: [
        'alreadyInitialized',
        'initialized',
        'marker',
        'mode',
        'nextActions',
        'profile',
        'requestedTool',
        'results',
        'route',
        'statusSnapshot',
    ],
    alembic_codex_job: ['job', 'jobs', 'jobRoute', 'projectRuntime', 'residentService'],
    alembic_codex_rescan: ['job', 'jobId', 'jobRoute', 'nextActions', 'needsUserInput', 'reasonCode'],
    alembic_codex_status: [
        'autoInit',
        'channel',
        'daemon',
        'hostProjectAlignment',
        'initialized',
        'knowledge',
        'nextActions',
        'onboarding',
        'package',
        'projectRoot',
        'projectRootResolution',
        'projectRuntime',
        'statusDiagnostics',
        'workspace',
    ],
    alembic_codex_stop: ['daemonReady', 'daemonStatus', 'pidAlive', 'stopped'],
};
export const CodexLocalToolOutputBaseSchema = CleanMcpResponseBaseSchema.extend({
    toolName: CodexLocalCleanOutputToolNameSchema,
}).strict();
export const CODEX_LOCAL_TOOL_OUTPUT_SCHEMAS = Object.fromEntries(CODEX_LOCAL_CLEAN_OUTPUT_TOOL_NAMES.map((toolName) => [
    toolName,
    createCodexLocalToolOutputSchema(toolName, CODEX_LOCAL_TOOL_ALLOWED_BUSINESS_FIELD_NAMES[toolName]),
]));
export function projectCodexLocalToolOutput(input, toolName) {
    const schema = CODEX_LOCAL_TOOL_OUTPUT_SCHEMAS[toolName];
    const alreadyClean = schema.safeParse(input);
    if (alreadyClean.success) {
        return alreadyClean.data;
    }
    const legacy = isRecord(input) ? input : {};
    const businessSource = extractLegacyBusinessValue(legacy);
    const business = sanitizeBusinessFields(businessSource, toolName);
    const ok = typeof legacy.success === 'boolean' ? legacy.success : legacy.errorCode == null;
    const cleanMeta = pickCleanMeta(legacy.meta);
    const errorDetails = pickLegacyErrorDetails(legacy, businessSource);
    const reasonCode = extractReasonCode(legacy, businessSource, errorDetails);
    const summary = buildCodexLocalToolSummary(toolName, {
        business,
        errorDetails,
        message: typeof legacy.message === 'string' ? legacy.message : '',
        ok,
    });
    const status = deriveCodexLocalToolStatus({ business, ok, reasonCode, toolName });
    const response = createCleanMcpResponse({
        ...business,
        ok,
        status,
        summary,
        toolName,
        ...(!ok
            ? {
                error: createCleanMcpError({
                    code: reasonCode || 'CODEX_MCP_ERROR',
                    ...(errorDetails === null ? {} : { details: errorDetails }),
                    message: summary,
                    source: errorDetails ?? legacy,
                    status,
                }),
            }
            : {}),
        ...(cleanMeta ? { meta: cleanMeta } : {}),
    }, toolName);
    return schema.parse(response);
}
export function findForbiddenCodexLocalOutputField(value, toolName, path = []) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
            const found = findForbiddenCodexLocalOutputField(item, toolName, [...path, String(index)]);
            if (found) {
                return found;
            }
        }
        return null;
    }
    for (const [key, child] of Object.entries(value)) {
        if (path.length === 0 && CODEX_LOCAL_FORBIDDEN_TOP_LEVEL_OUTPUT_KEYS.has(key)) {
            return { path: [key] };
        }
        if (path[0] !== 'meta' && isSensitiveCodexLocalOutputKey(key)) {
            return { path: [...path, key] };
        }
        if (path[0] !== 'meta' && shouldForbidRuntimeField(key, toolName)) {
            return { path: [...path, key] };
        }
        if (path.length === 0 && key === 'meta') {
            continue;
        }
        const found = findForbiddenCodexLocalOutputField(child, toolName, [...path, key]);
        if (found) {
            return found;
        }
    }
    return null;
}
function createCodexLocalToolOutputSchema(toolName, businessFields) {
    const shape = { toolName: z.literal(toolName) };
    for (const fieldName of businessFields) {
        shape[fieldName] = z.unknown().optional();
    }
    return CleanMcpResponseBaseSchema.extend(shape)
        .strict()
        .superRefine((output, ctx) => {
        const forbidden = findForbiddenCodexLocalOutputField(output, toolName);
        if (forbidden) {
            ctx.addIssue({
                code: 'custom',
                path: forbidden.path,
                message: `Codex local MCP clean output must not expose ${forbidden.path.join('.')}`,
            });
        }
    });
}
function extractLegacyBusinessValue(value) {
    if ('data' in value) {
        return value.data;
    }
    const out = {};
    for (const [key, child] of Object.entries(value)) {
        if (CODEX_LOCAL_FORBIDDEN_TOP_LEVEL_OUTPUT_KEYS.has(key) || key === 'meta') {
            continue;
        }
        out[key] = child;
    }
    return out;
}
function sanitizeBusinessFields(value, toolName) {
    const sanitized = sanitizeBusinessValue(normalizeBusinessValue(value, toolName), toolName);
    let business;
    if (isRecord(sanitized)) {
        business = renameReservedTopLevelFields(sanitized);
    }
    else if (sanitized === undefined || sanitized === null) {
        business = {};
    }
    else {
        business = { value: sanitized };
    }
    return pickAllowedBusinessFields(business, toolName);
}
function normalizeBusinessValue(value, toolName) {
    if (!isRecord(value)) {
        return value;
    }
    const out = { ...value };
    if (toolName === 'alembic_codex_status' && 'diagnostics' in out) {
        out.statusDiagnostics = out.diagnostics;
        delete out.diagnostics;
    }
    if (toolName === 'alembic_codex_init' && 'status' in out) {
        out.statusSnapshot = out.status;
        delete out.status;
    }
    if (toolName === 'alembic_codex_stop' && isRecord(out.daemon)) {
        out.daemonReady = out.daemon.ready === true;
        out.daemonStatus = typeof out.daemon.status === 'string' ? out.daemon.status : null;
        out.pidAlive = out.daemon.pidAlive === true;
        out.stopped = out.daemon.ready !== true && out.daemon.pidAlive !== true;
        delete out.daemon;
    }
    if ((toolName === 'alembic_codex_bootstrap' || toolName === 'alembic_codex_rescan') &&
        out.errorCode) {
        out.reasonCode = out.errorCode;
    }
    if (toolName === 'alembic_codex_dashboard' && out.errorCode) {
        out.reasonCode = out.errorCode;
    }
    return out;
}
function sanitizeBusinessValue(value, toolName) {
    if (!value || typeof value !== 'object') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeBusinessValue(item, toolName));
    }
    const out = {};
    for (const [key, child] of Object.entries(value)) {
        if (shouldStripRuntimeField(key, toolName) || isSensitiveCodexLocalOutputKey(key)) {
            continue;
        }
        const sanitized = sanitizeBusinessValue(child, toolName);
        if (sanitized !== undefined) {
            out[key] = sanitized;
        }
    }
    return out;
}
function renameReservedTopLevelFields(value) {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
        const nextKey = RESERVED_TOP_LEVEL_FIELD_RENAMES[key] ?? key;
        out[nextKey] = child;
    }
    return out;
}
function pickAllowedBusinessFields(value, toolName) {
    const allowed = new Set(CODEX_LOCAL_TOOL_ALLOWED_BUSINESS_FIELD_NAMES[toolName]);
    const out = {};
    for (const [key, child] of Object.entries(value)) {
        if (allowed.has(key)) {
            out[key] = child;
        }
    }
    return out;
}
function shouldStripRuntimeField(key, toolName) {
    return (!isRuntimeDiagnosticTool(toolName) &&
        (CODEX_LOCAL_IMPLICIT_RUNTIME_OUTPUT_KEYS.has(key) ||
            key === 'daemon' ||
            key === 'projectScopeIdentity'));
}
function shouldForbidRuntimeField(key, toolName) {
    if (!toolName || isRuntimeDiagnosticTool(toolName)) {
        return false;
    }
    return CODEX_LOCAL_IMPLICIT_RUNTIME_OUTPUT_KEYS.has(key);
}
function isRuntimeDiagnosticTool(toolName) {
    return CODEX_LOCAL_RUNTIME_DIAGNOSTIC_TOOL_NAMES.includes(toolName);
}
function isSensitiveCodexLocalOutputKey(key) {
    const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return CODEX_LOCAL_SENSITIVE_OUTPUT_KEYS.has(normalized);
}
function pickCleanMeta(value) {
    if (!isRecord(value)) {
        return null;
    }
    const out = {};
    for (const [key, child] of Object.entries(value)) {
        if (ALLOWED_CLEAN_META_KEYS.has(key)) {
            out[key] = child;
        }
    }
    return Object.keys(out).length > 0 ? out : null;
}
function extractReasonCode(legacy, businessSource, errorDetails) {
    if (isRecord(businessSource) && typeof businessSource.errorCode === 'string') {
        return businessSource.errorCode;
    }
    if (typeof legacy.errorCode === 'string') {
        return legacy.errorCode;
    }
    for (const key of ['code', 'mcpErrorCode', 'reasonCode']) {
        const value = errorDetails?.[key];
        if (typeof value === 'string' && value.length > 0) {
            return value;
        }
    }
    return null;
}
function pickLegacyErrorDetails(legacy, businessSource) {
    if (isRecord(legacy.error)) {
        return legacy.error;
    }
    if (isRecord(businessSource) && isRecord(businessSource.error)) {
        return businessSource.error;
    }
    return null;
}
function deriveCodexLocalToolStatus(input) {
    if (!input.ok) {
        return 'blocked';
    }
    if (input.toolName === 'alembic_codex_cleanup' && input.business.dryRun === true) {
        return 'preview';
    }
    if (input.reasonCode) {
        return 'blocked';
    }
    if (input.business.businessOk === false) {
        return 'degraded';
    }
    return 'ready';
}
function buildCodexLocalToolSummary(toolName, input) {
    if (input.message.trim()) {
        return input.message.trim();
    }
    if (!input.ok && typeof input.errorDetails?.message === 'string') {
        return input.errorDetails.message;
    }
    if (!input.ok) {
        return `${toolName} blocked.`;
    }
    if (toolName === 'alembic_codex_status') {
        return 'Alembic Codex status checked.';
    }
    if (toolName === 'alembic_codex_diagnostics') {
        return typeof input.business.businessSummary === 'string'
            ? input.business.businessSummary
            : 'Alembic Codex diagnostics completed.';
    }
    if (toolName === 'alembic_codex_init') {
        return 'Alembic Codex workspace initialized.';
    }
    if (toolName === 'alembic_codex_dashboard') {
        return input.business.dashboardUrl
            ? 'Alembic Dashboard handoff ready.'
            : 'Alembic Dashboard handoff checked.';
    }
    if (toolName === 'alembic_codex_bootstrap') {
        return 'Alembic Codex bootstrap job checked.';
    }
    if (toolName === 'alembic_codex_rescan') {
        return 'Alembic Codex rescan job checked.';
    }
    if (toolName === 'alembic_codex_job') {
        return Array.isArray(input.business.jobs)
            ? `Alembic Codex job list returned ${input.business.jobs.length} item(s).`
            : 'Alembic Codex job status checked.';
    }
    if (toolName === 'alembic_codex_stop') {
        return 'Alembic Codex daemon stop requested.';
    }
    return input.business.dryRun === true
        ? 'Alembic Codex cleanup preview completed.'
        : 'Alembic Codex runtime cleanup completed.';
}
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
for (const toolName of CODEX_LOCAL_CLEAN_OUTPUT_TOOL_NAMES) {
    registerMcpOutputProjector({
        outputSchema: CODEX_LOCAL_TOOL_OUTPUT_SCHEMAS[toolName],
        outputSchemaName: `${toolName}_clean_output`,
        project: (input) => projectCodexLocalToolOutput(input, toolName),
        projectorName: 'codex-local-clean-output-projector',
        toolName,
    });
}
