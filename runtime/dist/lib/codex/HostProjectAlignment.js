import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createProjectRuntimeControlState, PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION, } from '@alembic/core/daemon';
import { getProjectRegistryDir, normalizeProjectPath, ProjectRegistry, } from '@alembic/core/workspace';
export function buildCodexHostProjectAlignment(input) {
    const hostProject = projectFromRoot(input.projectRoot, 'codex-host');
    const runtimeControl = readProjectRuntimeControlState();
    const selectedProject = projectFromRuntimeControlTarget(runtimeControl.state.selectedProjectRoot, runtimeControl.state.selectedProjectId, 'runtime-control-state');
    const activeRuntimeProject = projectFromRuntimeControlTarget(runtimeControl.state.activeProjectRoot, runtimeControl.state.activeProjectId, 'runtime-control-state') ||
        projectFromDaemonBoundary(input.enhancementRoute) ||
        projectFromDaemonState(input.daemonStatus);
    const hostRoot = hostProject.projectRealpath || hostProject.projectRoot;
    const selectedRoot = selectedProject?.projectRealpath || selectedProject?.projectRoot || null;
    const activeRoot = activeRuntimeProject?.projectRealpath || activeRuntimeProject?.projectRoot || null;
    const selectedDiffers = Boolean(selectedRoot && !sameProjectRoot(hostRoot, selectedRoot));
    const activeDiffers = Boolean(activeRoot && !sameProjectRoot(hostRoot, activeRoot));
    const connectionState = resolveConnectionState({
        activeDiffers,
        activeRoot,
        daemonReady: input.daemonStatus.ready === true,
        hostRoot,
        runtimeControl: runtimeControl.summary,
        selectedDiffers,
        selectedRoot,
    });
    const handoffMismatch = buildHandoffMismatch({
        activeDiffers,
        activeRoot,
        connectionState,
        hostRoot,
        runtimeControl: runtimeControl.summary,
        selectedDiffers,
        selectedRoot,
    });
    return {
        activeRuntimeProject,
        connectionState,
        handoffAllowed: connectionState === 'connected',
        handoffMismatch,
        hostProject,
        nextActions: buildAlignmentNextActions(connectionState),
        runtimeControlState: runtimeControl.summary,
        selectedProject,
        sources: {
            daemonRuntimeBoundary: Boolean(input.enhancementRoute?.localAlembic.daemon.runtimeBoundary.available),
            daemonState: input.daemonStatus.ready === true && Boolean(input.daemonStatus.state),
            projectRegistry: hostProject.registered === true,
            projectsApi: false,
            runtimeControlState: runtimeControl.summary.source === 'readable',
        },
    };
}
export function getCodexProjectRuntimeControlStatePath() {
    return join(getProjectRegistryDir(), 'runtime-control.json');
}
function readProjectRuntimeControlState() {
    const path = getCodexProjectRuntimeControlStatePath();
    const exists = existsSync(path);
    if (!exists) {
        return {
            state: createProjectRuntimeControlState(),
            summary: {
                exists: false,
                path,
                readable: false,
                schemaVersion: null,
                selectedAt: null,
                source: 'missing',
                updatedAt: null,
            },
        };
    }
    try {
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : null;
        if (schemaVersion !== PROJECT_RUNTIME_CONTROL_STATE_SCHEMA_VERSION) {
            return {
                state: createProjectRuntimeControlState(),
                summary: {
                    exists: true,
                    path,
                    readable: true,
                    schemaVersion,
                    selectedAt: nullableString(parsed.selectedAt),
                    source: 'unsupported-schema',
                    updatedAt: nullableString(parsed.updatedAt),
                },
            };
        }
        const state = createProjectRuntimeControlState({
            activeProjectId: nullableString(parsed.activeProjectId),
            activeProjectRoot: nullableString(parsed.activeProjectRoot),
            selectedAt: nullableString(parsed.selectedAt),
            selectedProjectId: nullableString(parsed.selectedProjectId),
            selectedProjectRoot: nullableString(parsed.selectedProjectRoot),
            updatedAt: nullableString(parsed.updatedAt) ?? new Date(0).toISOString(),
        });
        return {
            state,
            summary: {
                exists: true,
                path,
                readable: true,
                schemaVersion,
                selectedAt: state.selectedAt,
                source: 'readable',
                updatedAt: state.updatedAt,
            },
        };
    }
    catch {
        return {
            state: createProjectRuntimeControlState(),
            summary: {
                exists: true,
                path,
                readable: false,
                schemaVersion: null,
                selectedAt: null,
                source: 'unreadable',
                updatedAt: null,
            },
        };
    }
}
function resolveConnectionState(input) {
    if (!input.hostRoot) {
        return 'unavailable';
    }
    if (input.selectedDiffers || input.activeDiffers) {
        return 'mismatch';
    }
    if (input.daemonReady && (input.activeRoot || input.runtimeControl.source !== 'readable')) {
        return 'connected';
    }
    if (input.selectedRoot || input.activeRoot) {
        return 'disconnected';
    }
    return 'unavailable';
}
function buildHandoffMismatch(input) {
    if (input.connectionState === 'connected') {
        return null;
    }
    if (!input.hostRoot) {
        return {
            activeRoot: input.activeRoot,
            hostRoot: input.hostRoot,
            reason: 'host-project-unavailable',
            selectedRoot: input.selectedRoot,
        };
    }
    if (input.selectedDiffers) {
        return {
            activeRoot: input.activeRoot,
            hostRoot: input.hostRoot,
            reason: 'selected-project-differs',
            selectedRoot: input.selectedRoot,
        };
    }
    if (input.activeDiffers) {
        return {
            activeRoot: input.activeRoot,
            hostRoot: input.hostRoot,
            reason: 'active-runtime-project-differs',
            selectedRoot: input.selectedRoot,
        };
    }
    return {
        activeRoot: input.activeRoot,
        hostRoot: input.hostRoot,
        reason: input.runtimeControl.source === 'missing'
            ? 'runtime-control-unavailable'
            : 'active-runtime-unavailable',
        selectedRoot: input.selectedRoot,
    };
}
function buildAlignmentNextActions(state) {
    if (state === 'connected') {
        return ['Codex host project is aligned with the Alembic selected and active runtime project.'];
    }
    if (state === 'mismatch') {
        return [
            'Switch Alembic selected/active project to this Codex host project from Alembic or Dashboard before opening Dashboard through Codex.',
            'Run alembic_codex_status again after the Alembic project selection changes.',
        ];
    }
    if (state === 'disconnected') {
        return [
            'Start or reconnect the Alembic runtime for this selected project from Alembic or Dashboard before Dashboard handoff through Codex.',
            'Run alembic_codex_status again after the active runtime is ready.',
        ];
    }
    return [
        'Select and start this project from Alembic or Dashboard, then rerun alembic_codex_status.',
    ];
}
function projectFromDaemonBoundary(enhancementRoute) {
    const workspace = enhancementRoute?.localAlembic.daemon.runtimeBoundary.workspace;
    if (!workspace?.projectRoot) {
        return null;
    }
    return projectFromRoot(workspace.projectRoot, 'daemon-runtime-boundary', {
        dataRoot: workspace.dataRoot,
        dataRootSource: workspace.dataRootSource,
        projectId: workspace.projectId,
    });
}
function projectFromDaemonState(status) {
    if (!status.ready || !status.state?.projectRoot) {
        return null;
    }
    return projectFromRoot(status.state.projectRoot, 'daemon-state', {
        dataRoot: status.state.dataRoot,
        dataRootSource: null,
        projectId: status.state.projectId,
    });
}
function projectFromRuntimeControlTarget(projectRoot, projectId, source) {
    const root = projectRoot || findRegisteredProjectRootById(projectId);
    if (!root) {
        return null;
    }
    return projectFromRoot(root, source, { projectId });
}
function projectFromRoot(projectRootInput, source, overrides = {}) {
    const fallbackRoot = resolve(projectRootInput);
    let inspection = null;
    try {
        inspection = ProjectRegistry.inspect(projectRootInput);
    }
    catch {
        inspection = null;
    }
    return {
        dataRoot: overrides.dataRoot ?? inspection?.dataRoot ?? null,
        dataRootSource: overrides.dataRootSource ?? inspection?.dataRootSource ?? null,
        ghost: inspection?.ghost ?? null,
        projectId: overrides.projectId ?? inspection?.projectId ?? null,
        projectRealpath: inspection?.projectRealpath ?? safeNormalizeProjectPath(fallbackRoot),
        projectRoot: inspection?.projectRoot ?? fallbackRoot,
        registered: inspection?.registered ?? null,
        source,
    };
}
function findRegisteredProjectRootById(projectId) {
    if (!projectId) {
        return null;
    }
    try {
        return (ProjectRegistry.list().find((project) => project.entry.id === projectId)?.projectRoot ?? null);
    }
    catch {
        return null;
    }
}
function sameProjectRoot(left, right) {
    if (!left || !right) {
        return false;
    }
    return safeNormalizeProjectPath(left) === safeNormalizeProjectPath(right);
}
function safeNormalizeProjectPath(projectRoot) {
    try {
        return normalizeProjectPath(projectRoot);
    }
    catch {
        return resolve(projectRoot);
    }
}
function nullableString(value) {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
