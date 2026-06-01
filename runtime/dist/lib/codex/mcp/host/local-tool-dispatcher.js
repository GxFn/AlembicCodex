export function dispatchCodexLocalTool(name, args, handlers) {
    switch (name) {
        case 'alembic_codex_status':
            return { handled: true, result: handlers.buildStatus() };
        case 'alembic_codex_diagnostics':
            return { handled: true, result: handlers.buildDiagnostics() };
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
