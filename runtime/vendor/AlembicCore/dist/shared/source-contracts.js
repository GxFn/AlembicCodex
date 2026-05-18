export const HOST_AGENT_SOURCE = 'host-agent';
export const ALEMBIC_AGENT_SOURCE = 'alembic-agent';
export const LEGACY_IDE_AGENT_SOURCE = 'ide-agent';
export const HOST_EDIT_SOURCE = 'host-edit';
export const LEGACY_IDE_EDIT_SOURCE = 'ide-edit';
export function isLegacyAgentSource(source) {
    return source === LEGACY_IDE_AGENT_SOURCE;
}
export function normalizeProposalSource(source) {
    return source === LEGACY_IDE_AGENT_SOURCE ? HOST_AGENT_SOURCE : source;
}
export function proposalSourceStorageValues(source) {
    const canonical = normalizeProposalSource(source);
    if (canonical === HOST_AGENT_SOURCE) {
        return [HOST_AGENT_SOURCE, LEGACY_IDE_AGENT_SOURCE];
    }
    return [canonical];
}
export function getProposalSourceLabel(source) {
    return normalizeProposalSource(source);
}
export function normalizeGatewaySource(source) {
    return source === LEGACY_IDE_AGENT_SOURCE ? HOST_AGENT_SOURCE : source;
}
export function getGatewaySourceUserId(source) {
    switch (normalizeGatewaySource(source)) {
        case 'agent-tool':
            return 'agent';
        case 'mcp-external':
            return 'mcp';
        case HOST_AGENT_SOURCE:
            return HOST_AGENT_SOURCE;
        case ALEMBIC_AGENT_SOURCE:
            return ALEMBIC_AGENT_SOURCE;
        case 'batch-import':
            return 'batch-import';
    }
}
export function getGatewaySourceLabel(source) {
    switch (normalizeGatewaySource(source)) {
        case 'agent-tool':
            return 'agent';
        case 'mcp-external':
            return 'mcp';
        case HOST_AGENT_SOURCE:
            return HOST_AGENT_SOURCE;
        case ALEMBIC_AGENT_SOURCE:
            return ALEMBIC_AGENT_SOURCE;
        case 'batch-import':
            return 'batch-import';
    }
}
export function isLegacyFileChangeEventSource(source) {
    return source === LEGACY_IDE_EDIT_SOURCE;
}
export function normalizeFileChangeEventSource(source) {
    return !source || source === LEGACY_IDE_EDIT_SOURCE ? HOST_EDIT_SOURCE : source;
}
export function getFileChangeEventSourceLabel(source) {
    return normalizeFileChangeEventSource(source);
}
