export const LEGACY_HOST_AI_MANAGED_CODE = 'HOST_AI_MANAGED';
export const HOST_AGENT_MANAGED_CODE = 'HOST_AGENT_MANAGED';
export const PLUGIN_DETERMINISTIC_EXTRACT_CODE = 'PLUGIN_DETERMINISTIC_EXTRACT';
function makeBoundary(code, context, owner, note, legacyCode) {
    return {
        code,
        legacyCode,
        context,
        owner,
        enhancementOwner: 'codex-host-agent-or-alembic-resident-service',
        hostManaged: true,
        localAi: false,
        localAiProvider: false,
        pluginAiProvider: false,
        note,
    };
}
export function makeHostAgentManagedError(message) {
    return {
        code: LEGACY_HOST_AI_MANAGED_CODE,
        canonicalCode: HOST_AGENT_MANAGED_CODE,
        boundaryCode: HOST_AGENT_MANAGED_CODE,
        message,
    };
}
export function attachHostAgentManagedBoundary(payload, context, note = 'AlembicPlugin 不执行本地第三方 AI；候选增强由 Codex host agent 或 Alembic resident service 接管。') {
    const boundary = makeBoundary(HOST_AGENT_MANAGED_CODE, context, 'codex-host-agent', note, LEGACY_HOST_AI_MANAGED_CODE);
    return {
        ...payload,
        hostManaged: true,
        boundaryCode: HOST_AGENT_MANAGED_CODE,
        canonicalCode: HOST_AGENT_MANAGED_CODE,
        legacyBoundaryCode: LEGACY_HOST_AI_MANAGED_CODE,
        localAi: false,
        localAiProvider: false,
        pluginAiProvider: false,
        capabilityBoundary: boundary,
    };
}
export function attachPluginDeterministicBoundary(payload, context, note = 'AlembicPlugin 只执行确定性提取；语义增强仍由 Codex host agent 或 Alembic resident service 接管。') {
    const boundary = makeBoundary(PLUGIN_DETERMINISTIC_EXTRACT_CODE, context, 'alembic-plugin', note);
    return {
        ...payload,
        hostManaged: true,
        boundaryCode: PLUGIN_DETERMINISTIC_EXTRACT_CODE,
        canonicalCode: PLUGIN_DETERMINISTIC_EXTRACT_CODE,
        legacyHostManaged: true,
        localAi: false,
        localAiProvider: false,
        pluginAiProvider: false,
        capabilityBoundary: boundary,
    };
}
