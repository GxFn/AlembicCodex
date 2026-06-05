import { z } from 'zod';
export const AGENT_PUBLIC_TOOL_CONTRACT_VERSION = 1;
export const AGENT_PUBLIC_TOOL_NAMES = [
    'alembic_intent',
    'alembic_prime',
    'alembic_work_start',
    'alembic_work_finish',
    'alembic_code_guard',
    'alembic_decision_record',
];
export const AGENT_HOSTS = ['codex', 'claude-code', 'generic-host-agent'];
export const AGENT_INPUT_SOURCES = [
    'host-declared-intent',
    'host-turn-metadata',
    'user-message',
    'automation-envelope',
    'source-ref',
    'tool-result',
    'legacy-compatibility',
];
export const AGENT_INTENT_KINDS = [
    'implementation-task',
    'fix-task',
    'refactor-task',
    'review-task',
    'read-only-analysis',
    'status-only',
    'decision',
    'design-or-planning',
    'mechanical-envelope',
    'unknown',
];
export const AGENT_ACTION_KINDS = [
    'intent',
    'prime',
    'work-start',
    'work-finish',
    'code-guard',
    'decision-record',
];
export const AGENT_RESULT_STATUSES = ['ready', 'skipped', 'degraded', 'blocked', 'failed'];
export const AGENT_SKIP_REASON_CODES = [
    'no-semantic-intent',
    'status-only-turn',
    'mechanical-envelope-only',
    'no-work-scope',
    'no-code-scope',
    'not-relevant-to-project-knowledge',
];
export const AGENT_DEGRADED_REASON_CODES = [
    'low-confidence-intent',
    'resident-unavailable',
    'project-scope-unavailable',
    'knowledge-empty',
    'detail-budget-limited',
    'optional-service-unavailable',
];
export const AGENT_BLOCKED_REASON_CODES = [
    'project-root-untrusted',
    'missing-required-intent',
    'missing-referenced-docs',
    'missing-prime-scope',
    'missing-work-ref',
    'missing-guard-scope',
    'decision-scope-unconfirmed',
    'decision-register-capability-mismatch',
    'decision-register-unavailable',
    'shared-contract-required',
];
export const AGENT_FAILURE_REASON_CODES = [
    'schema-validation-failed',
    'handler-error',
    'result-envelope-invalid',
];
export const AgentPublicToolNameSchema = z.enum(AGENT_PUBLIC_TOOL_NAMES);
export const AgentHostSchema = z.enum(AGENT_HOSTS);
export const AgentInputSourceSchema = z.enum(AGENT_INPUT_SOURCES);
export const AgentIntentKindSchema = z.enum(AGENT_INTENT_KINDS);
export const AgentActionKindSchema = z.enum(AGENT_ACTION_KINDS);
export const AgentResultStatusSchema = z.enum(AGENT_RESULT_STATUSES);
export const AgentSkipReasonCodeSchema = z.enum(AGENT_SKIP_REASON_CODES);
export const AgentDegradedReasonCodeSchema = z.enum(AGENT_DEGRADED_REASON_CODES);
export const AgentBlockedReasonCodeSchema = z.enum(AGENT_BLOCKED_REASON_CODES);
export const AgentFailureReasonCodeSchema = z.enum(AGENT_FAILURE_REASON_CODES);
export const AGENT_PUBLIC_TOOL_ACTION_BY_NAME = {
    alembic_intent: 'intent',
    alembic_prime: 'prime',
    alembic_work_start: 'work-start',
    alembic_work_finish: 'work-finish',
    alembic_code_guard: 'code-guard',
    alembic_decision_record: 'decision-record',
};
export const AgentPublicToolRefSchema = z.object({
    refType: z.enum(['intent', 'prime', 'work', 'finish', 'guard-result', 'decision', 'detail']),
    id: z.string().min(1).max(240),
    label: z.string().min(1).max(160).optional(),
    source: AgentInputSourceSchema.optional(),
    toolName: AgentPublicToolNameSchema.optional(),
});
export const AgentDetailRefSchema = z.object({
    id: z.string().min(1).max(240),
    kind: z.enum([
        'catalog',
        'contract',
        'file',
        'runtime-json',
        'log',
        'report',
        'schema',
        'source-ref',
        'test-output',
    ]),
    summary: z.string().min(1).max(500),
    uri: z.string().min(1).max(1200).optional(),
    requiredForCompletion: z.boolean().default(false),
});
export const AgentPublicToolOutputBudgetSchema = z
    .object({
    mode: z.enum(['compact', 'standard', 'detailed']).default('compact'),
    maxChars: z.number().int().min(1).max(20000),
    usedChars: z.number().int().min(0).max(20000),
    truncated: z.boolean(),
})
    .refine((budget) => budget.usedChars <= budget.maxChars, {
    message: 'usedChars must be less than or equal to maxChars',
});
export const AgentPublicToolResultSummarySchema = z.object({
    compact: z.string().min(1).max(2000),
    title: z.string().min(1).max(140).optional(),
    outputBudget: AgentPublicToolOutputBudgetSchema,
});
export const AgentPublicToolReasonSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('skip'),
        code: AgentSkipReasonCodeSchema,
        message: z.string().min(1).max(600),
        retryable: z.boolean().default(false),
    }),
    z.object({
        kind: z.literal('degraded'),
        code: AgentDegradedReasonCodeSchema,
        message: z.string().min(1).max(600),
        retryable: z.boolean().default(true),
    }),
    z.object({
        kind: z.literal('blocked'),
        code: AgentBlockedReasonCodeSchema,
        message: z.string().min(1).max(600),
        retryable: z.boolean().default(false),
    }),
    z.object({
        kind: z.literal('failure'),
        code: AgentFailureReasonCodeSchema,
        message: z.string().min(1).max(600),
        retryable: z.boolean().default(false),
    }),
]);
export const AgentPublicToolRefsSchema = z.object({
    intentRef: AgentPublicToolRefSchema.optional(),
    primeRef: AgentPublicToolRefSchema.optional(),
    workRef: AgentPublicToolRefSchema.optional(),
    finishRef: AgentPublicToolRefSchema.optional(),
    guardResultRef: AgentPublicToolRefSchema.optional(),
    decisionRef: AgentPublicToolRefSchema.optional(),
    detailRefs: z.array(AgentDetailRefSchema).max(40).default([]),
});
export const AgentPublicToolLegacyCompatibilitySchema = z.object({
    usesLegacyTaskHandler: z.literal(false),
    compatibilityRole: z.enum(['none', 'consumer-only']).default('none'),
});
export const AgentPublicToolResultEnvelopeSchema = z
    .object({
    contractVersion: z.literal(AGENT_PUBLIC_TOOL_CONTRACT_VERSION),
    toolName: AgentPublicToolNameSchema,
    actionKind: AgentActionKindSchema,
    status: AgentResultStatusSchema,
    agentHost: AgentHostSchema,
    inputSource: AgentInputSourceSchema,
    intentKind: AgentIntentKindSchema.optional(),
    summary: AgentPublicToolResultSummarySchema,
    refs: AgentPublicToolRefsSchema,
    reason: AgentPublicToolReasonSchema.optional(),
    legacyCompatibility: AgentPublicToolLegacyCompatibilitySchema.default({
        usesLegacyTaskHandler: false,
        compatibilityRole: 'none',
    }),
})
    .superRefine((envelope, ctx) => {
    const expectedAction = AGENT_PUBLIC_TOOL_ACTION_BY_NAME[envelope.toolName];
    if (envelope.actionKind !== expectedAction) {
        ctx.addIssue({
            code: 'custom',
            path: ['actionKind'],
            message: `actionKind must match ${expectedAction} for ${envelope.toolName}`,
        });
    }
    const reasonKindByStatus = {
        skipped: 'skip',
        degraded: 'degraded',
        blocked: 'blocked',
        failed: 'failure',
    };
    const expectedReasonKind = reasonKindByStatus[envelope.status];
    if (expectedReasonKind && envelope.reason?.kind !== expectedReasonKind) {
        ctx.addIssue({
            code: 'custom',
            path: ['reason'],
            message: `${envelope.status} results require a ${expectedReasonKind} reason`,
        });
    }
});
function definition(name, inputContract, producesRefs, implementation = {
    activeMcpSurface: false,
    handlerDependency: 'none',
    implementationStatus: 'contract-only',
}) {
    return {
        activeMcpSurface: implementation.activeMcpSurface,
        actionKind: AGENT_PUBLIC_TOOL_ACTION_BY_NAME[name],
        handlerDependency: implementation.handlerDependency,
        implementationStatus: implementation.implementationStatus,
        inputContract,
        name,
        resultContract: {
            producesRefs,
            reasonKinds: ['skip', 'degraded', 'blocked', 'failure'],
            statuses: AGENT_RESULT_STATUSES,
        },
    };
}
export const AGENT_PUBLIC_TOOL_CONTRACT_CATALOG = [
    definition('alembic_intent', {
        acceptedRefs: ['detailRefs'],
        requiredFields: ['agentHost', 'inputSource'],
    }, ['intentRef', 'detailRefs'], {
        activeMcpSurface: true,
        handlerDependency: 'McpServer.agent-public-tools',
        implementationStatus: 'active-tool',
    }),
    definition('alembic_prime', {
        acceptedRefs: ['intentRef', 'detailRefs'],
        requiredFields: ['agentHost', 'inputSource', 'intentRef'],
    }, ['primeRef', 'detailRefs'], {
        activeMcpSurface: true,
        handlerDependency: 'McpServer.agent-public-tools',
        implementationStatus: 'active-tool',
    }),
    definition('alembic_work_start', {
        acceptedRefs: ['intentRef', 'primeRef', 'detailRefs'],
        requiredFields: ['agentHost', 'inputSource', 'intentRef'],
    }, ['workRef', 'detailRefs'], {
        activeMcpSurface: true,
        handlerDependency: 'McpServer.agent-public-tools',
        implementationStatus: 'active-tool',
    }),
    definition('alembic_work_finish', {
        acceptedRefs: ['intentRef', 'primeRef', 'workRef', 'detailRefs'],
        requiredFields: ['agentHost', 'inputSource', 'workRef'],
    }, ['workRef', 'finishRef', 'detailRefs'], {
        activeMcpSurface: true,
        handlerDependency: 'McpServer.agent-public-tools',
        implementationStatus: 'active-tool',
    }),
    definition('alembic_code_guard', {
        acceptedRefs: ['intentRef', 'workRef', 'detailRefs'],
        requiredFields: ['agentHost', 'inputSource'],
    }, ['guardResultRef', 'detailRefs'], {
        activeMcpSurface: true,
        handlerDependency: 'McpServer.agent-public-tools',
        implementationStatus: 'active-tool',
    }),
    definition('alembic_decision_record', {
        acceptedRefs: ['intentRef', 'workRef', 'detailRefs'],
        requiredFields: ['agentHost', 'inputSource'],
    }, ['decisionRef', 'detailRefs'], {
        activeMcpSurface: true,
        handlerDependency: 'McpServer.agent-public-tools',
        implementationStatus: 'active-tool',
    }),
];
const AGENT_PUBLIC_TOOL_CONTRACT_BY_NAME = Object.fromEntries(AGENT_PUBLIC_TOOL_CONTRACT_CATALOG.map((entry) => [entry.name, entry]));
export function getAgentPublicToolContractDefinition(name) {
    return AGENT_PUBLIC_TOOL_CONTRACT_BY_NAME[name];
}
export function listAgentPublicToolContractCatalog() {
    return AGENT_PUBLIC_TOOL_CONTRACT_CATALOG.map((entry) => ({
        ...entry,
        inputContract: {
            acceptedRefs: [...entry.inputContract.acceptedRefs],
            requiredFields: [...entry.inputContract.requiredFields],
        },
        resultContract: {
            producesRefs: [...entry.resultContract.producesRefs],
            reasonKinds: [...entry.resultContract.reasonKinds],
            statuses: [...entry.resultContract.statuses],
        },
    }));
}
export function createAgentDetailRef(input) {
    return AgentDetailRefSchema.parse(input);
}
export function createAgentPublicToolResultEnvelope(input) {
    return AgentPublicToolResultEnvelopeSchema.parse({
        contractVersion: AGENT_PUBLIC_TOOL_CONTRACT_VERSION,
        legacyCompatibility: {
            usesLegacyTaskHandler: false,
            compatibilityRole: 'none',
        },
        ...input,
    });
}
