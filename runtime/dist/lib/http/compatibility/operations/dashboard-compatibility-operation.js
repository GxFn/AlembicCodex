import { randomUUID } from 'node:crypto';
import { sendToolEnvelopeResponse, } from '../../utils/tool-envelope-response.js';
const EMPTY_DIAGNOSTICS = {
    degraded: false,
    fallbackUsed: false,
    warnings: [],
    timedOutStages: [],
    blockedTools: [],
    truncatedToolCalls: 0,
    emptyResponses: 0,
    aiErrorCount: 0,
    gateFailures: [],
};
const DEFAULT_TRUST = {
    source: 'internal',
    sanitized: true,
    containsUntrustedText: false,
    containsSecrets: false,
};
/**
 * 历史 Dashboard HTTP operation 兼容分派器。
 * 这些 dashboard.* ID 是外部协议，源码边界属于 Plugin embedded HTTP compatibility，
 * 不表示本仓库重新拥有 Dashboard 前端。
 */
export async function executeDashboardCompatibilityOperation(container, req, toolId, args) {
    const callId = randomUUID();
    const startedAt = new Date().toISOString();
    const t0 = Date.now();
    try {
        const { DASHBOARD_COMPATIBILITY_OPERATION_HANDLERS, DASHBOARD_COMPATIBILITY_OPERATION_MANIFESTS, } = await import('./DashboardCompatibilityOperations.js');
        const handler = DASHBOARD_COMPATIBILITY_OPERATION_HANDLERS[toolId];
        if (!handler) {
            return errorEnvelope(toolId, callId, startedAt, `Unknown dashboard operation: ${toolId}`);
        }
        const manifest = DASHBOARD_COMPATIBILITY_OPERATION_MANIFESTS.find((m) => m.id === toolId);
        const executionRequest = {
            manifest: manifest ?? { id: toolId, kind: 'dashboard-operation' },
            args,
            context: {
                services: container,
                projectRoot: '',
                actor: {
                    role: req.resolvedRole || 'dashboard',
                    user: req.resolvedUser || undefined,
                    sessionId: req.headers['x-session-id'],
                },
                surface: 'dashboard',
            },
            decision: { allowed: true, stage: 'execute' },
        };
        const data = await handler(executionRequest);
        const durationMs = Date.now() - t0;
        return {
            ok: true,
            toolId,
            callId,
            startedAt,
            durationMs,
            status: 'success',
            text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
            structuredContent: data ?? null,
            diagnostics: EMPTY_DIAGNOSTICS,
            trust: DEFAULT_TRUST,
        };
    }
    catch (err) {
        const durationMs = Date.now() - t0;
        return errorEnvelope(toolId, callId, startedAt, err instanceof Error ? err.message : String(err), durationMs);
    }
}
export function sendDashboardCompatibilityOperationResponse(res, envelope) {
    if (!envelope.ok) {
        sendToolEnvelopeResponse(res, envelope);
        return;
    }
    res.json({
        success: true,
        data: envelope.structuredContent ?? envelope,
        toolResult: envelope,
    });
}
function errorEnvelope(toolId, callId, startedAt, error, durationMs = 0) {
    return {
        ok: false,
        toolId,
        callId,
        startedAt,
        durationMs,
        status: 'error',
        text: error,
        diagnostics: EMPTY_DIAGNOSTICS,
        trust: DEFAULT_TRUST,
    };
}
