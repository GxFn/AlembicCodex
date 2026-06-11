export function dispatchCodexLocalTool(name, args, handlers) {
    switch (name) {
        case 'alembic_codex_status':
            return { handled: true, result: handlers.buildStatus() };
        case 'alembic_codex_diagnostics':
            return { handled: true, result: handlers.buildDiagnostics() };
        case 'alembic_source_graph_status':
            return { handled: true, result: handlers.buildSourceGraphStatus(args) };
        case 'alembic_symbol_search':
        case 'alembic_code_explore':
        case 'alembic_source_node':
        case 'alembic_callers':
        case 'alembic_callees':
        case 'alembic_code_impact':
        case 'alembic_affected_tests':
        case 'alembic_validation_plan':
            return { handled: true, result: handlers.buildSourceGraphOperation(name, args) };
        case 'alembic_codex_init':
            return { handled: true, result: handlers.initializeWorkspace(args) };
        case 'alembic_codex_dashboard':
            return { handled: true, result: handlers.openDashboard() };
        case 'alembic_codex_bootstrap':
            return { handled: true, result: handlers.enqueueJob('bootstrap', args) };
        case 'alembic_codex_rescan':
            return { handled: true, result: handlers.enqueueJob('rescan', args) };
        case 'alembic_codex_job':
            return { handled: true, result: handlers.readJob(args) };
        case 'alembic_codex_stop':
            return { handled: true, result: handlers.stopDaemon(args) };
        case 'alembic_codex_cleanup':
            return { handled: true, result: handlers.cleanupRuntime(args) };
        default:
            return { handled: false };
    }
}
