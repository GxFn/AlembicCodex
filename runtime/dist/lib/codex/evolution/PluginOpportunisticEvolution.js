export async function buildPluginOpportunisticEvolutionSurface(input) {
    const base = {
        autoSubmit: false,
        producerBoundary: {
            producerKind: 'plugin-opportunistic',
            separatedFrom: 'daemon-file-change',
        },
        serviceGate: input.serviceGate,
    };
    if (input.serviceGate.mainServiceCanHandleProjectScope) {
        return {
            ...base,
            evidenceGate: {
                verdict: 'defer-to-alembic-service',
                reasons: [
                    'Alembic resident service can handle the current project scope; Plugin fallback is a no-op.',
                ],
            },
        };
    }
    if (input.guardDecision && input.guardDecision.action !== 'run') {
        return {
            ...base,
            evidenceGate: {
                verdict: 'no-op',
                reasons: [
                    `Task close skipped task-scoped Guard (${input.guardDecision.reasonCode}); Plugin opportunistic evolution will not infer knowledge changes from unrelated dirty diff.`,
                ],
            },
        };
    }
    const scan = filterScanToTaskScopedFiles(input.scan ?? (await input.scanner?.scanOnce()), input.guardDecision?.taskScopedFiles);
    if (!scan || !scan.scanned || scan.events.length === 0) {
        return {
            ...base,
            evidenceGate: {
                verdict: 'no-op',
                reasons: [
                    scan?.scanned === false
                        ? 'Git diff evidence is unavailable; Plugin fallback will not infer knowledge changes.'
                        : 'No git diff evidence was found; Plugin fallback has nothing to surface.',
                ],
            },
            ...(scan ? { gitDiffEvidence: projectGitDiffEvidence(scan) } : {}),
        };
    }
    const sourceRefs = uniqueStrings(scan.events.map((event) => event.path));
    const hasProjectScope = input.projectRoot.trim().length > 0;
    const hasFileEvidence = sourceRefs.length > 0;
    const hasToolOutcome = input.toolOutcome?.success === true;
    const reasons = [
        input.serviceGate.reason,
        `git diff surfaced ${sourceRefs.length} changed path(s)`,
        hasToolOutcome
            ? `tool outcome available from ${input.toolOutcome?.tool}`
            : 'tool outcome evidence is missing or unsuccessful',
    ];
    if (hasProjectScope && hasFileEvidence && hasToolOutcome && input.toolOutcome) {
        return {
            ...base,
            evidenceGate: { verdict: 'strong-proposal', reasons },
            gitDiffEvidence: projectGitDiffEvidence(scan),
            proposal: {
                confidence: confidenceForDiff(scan),
                kind: 'knowledge-evolution-proposal',
                message: 'Plugin fallback found scoped git diff evidence after a successful host-agent tool outcome. Review the changed files and explicitly submit/evolve knowledge if warranted.',
                producerKind: 'plugin-opportunistic',
                sourceRefs,
                toolOutcome: input.toolOutcome,
            },
        };
    }
    return {
        ...base,
        evidenceGate: { verdict: 'weak-hint', reasons },
        gitDiffEvidence: projectGitDiffEvidence(scan),
        hint: {
            message: 'Plugin fallback found git diff evidence but not enough scoped tool outcome evidence for a strong proposal.',
            sourceRefs,
        },
    };
}
export function shouldAttachPluginOpportunisticEvolution(input) {
    return input.toolName === 'alembic_task' && input.args.operation === 'close';
}
export function extractTaskCloseGuardDecision(result) {
    if (!isRecord(result)) {
        return undefined;
    }
    const data = isRecord(result.data) ? result.data : {};
    const guardDecision = isRecord(data.guardDecision)
        ? data.guardDecision
        : isRecord(data.nextAction) && isRecord(data.nextAction.guardDecision)
            ? data.nextAction.guardDecision
            : null;
    if (!guardDecision) {
        return undefined;
    }
    const action = guardDecision.action === 'run' ? 'run' : 'skip';
    const reasonCode = typeof guardDecision.reasonCode === 'string' && guardDecision.reasonCode.trim()
        ? guardDecision.reasonCode.trim()
        : 'unknown';
    return {
        action,
        reasonCode,
        taskScopedFiles: normalizeSourceRefs(guardDecision.taskScopedFiles),
    };
}
export function extractTaskCloseOutcome(result) {
    if (!isRecord(result) || result.success === false) {
        return null;
    }
    const data = isRecord(result.data) ? result.data : {};
    const closed = isRecord(data.closed) ? data.closed : null;
    if (!closed) {
        return null;
    }
    return {
        tool: 'alembic_task',
        success: true,
        taskId: typeof closed.id === 'string' ? closed.id : null,
        reason: typeof closed.reason === 'string' ? closed.reason : null,
    };
}
function filterScanToTaskScopedFiles(scan, taskScopedFiles) {
    if (!scan || !taskScopedFiles || taskScopedFiles.length === 0) {
        return scan;
    }
    const scoped = new Set(normalizeSourceRefs(taskScopedFiles));
    const events = scan.events.filter((event) => scoped.has(normalizeSourceRef(event.path)));
    return {
        ...scan,
        dirtyPathCount: events.length,
        events,
    };
}
function projectGitDiffEvidence(scan) {
    return {
        dirtyPathCount: scan.dirtyPathCount,
        eventCount: scan.events.length,
        events: scan.events.map((event) => ({
            eventSource: event.eventSource,
            oldPath: event.oldPath,
            path: event.path,
            type: event.type,
        })),
        head: scan.head,
        scanned: scan.scanned,
        scannedAt: scan.scannedAt,
        signature: scan.signature,
    };
}
function confidenceForDiff(scan) {
    const hasDeletion = scan.events.some((event) => event.type === 'deleted');
    const hasModification = scan.events.some((event) => event.type === 'modified');
    if (hasDeletion) {
        return 0.78;
    }
    if (hasModification) {
        return 0.72;
    }
    return 0.66;
}
function uniqueStrings(values) {
    return [...new Set(values.filter((value) => value.trim().length > 0))];
}
function normalizeSourceRefs(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return uniqueStrings(value
        .filter((item) => typeof item === 'string')
        .map(normalizeSourceRef)
        .filter(Boolean));
}
function normalizeSourceRef(value) {
    return value.trim().replace(/\\/g, '/').replace(/^\.\//, '');
}
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
