export function createInactiveGitDiffCheckpointStatus(projectRoot, reason, enabled = true) {
    return {
        enabled,
        errors: [],
        healthy: false,
        lastCheckpointAt: null,
        lastDispatch: {
            at: null,
            batchCount: 0,
            eventCount: 0,
            source: null,
        },
        mode: 'git-diff-checkpoint',
        projectRoot,
        reason,
        scanner: {
            backend: 'git',
            dirtyPathCount: 0,
            healthy: false,
            lastError: null,
            lastEventCount: 0,
            lastHead: null,
            lastScanAt: null,
            lastSignature: null,
        },
        surface: 'codex-plugin',
    };
}
