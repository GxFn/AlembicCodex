export function resolveCodexServiceRequestBoundary(tool, args) {
    const operation = typeof args.operation === 'string' ? args.operation : null;
    // Codex-facing MCP tools are Plugin-owned. Alembic may still be asked through explicit resident
    // service APIs such as /api/v1/search, but never through the removed daemon MCP bridge.
    return {
        executionPath: 'plugin-owned-codex-facing',
        operation,
        owner: 'alembic-plugin',
        reason: buildPluginOwnedReason(tool, operation),
        residentServiceRequested: tool === 'alembic_search',
        sharedContractCandidate: true,
        tool,
    };
}
export function isPluginOwnedCodexFacingTool(decision) {
    return decision.executionPath === 'plugin-owned-codex-facing';
}
function buildPluginOwnedReason(tool, operation) {
    if (tool === 'alembic_task') {
        return operation
            ? 'alembic_task owns Codex intent lifecycle and prime host-response payloads; local daemon readiness must not transfer tool ownership.'
            : 'alembic_task validation and unknown-operation errors are Plugin-owned Codex-facing semantics.';
    }
    if (tool === 'alembic_search') {
        return 'alembic_search is Codex-facing and runs in AlembicPlugin; semantic/vector enhancement must use the explicit Alembic resident /api/v1/search API.';
    }
    return 'Codex-facing Alembic tools run in AlembicPlugin; the daemon MCP compatibility bridge is removed.';
}
