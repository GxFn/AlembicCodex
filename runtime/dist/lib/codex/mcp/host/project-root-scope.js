import { isAbsolute } from 'node:path';
import { isTrustedCodexProjectRoot, resolveCodexProjectRoot, writeCodexSavedProjectRoot, } from '../../index.js';
import { failureResult } from './results.js';
export function resolveCodexProjectRootScope(toolName, args) {
    const projectRootArg = args.projectRoot;
    if (projectRootArg === undefined) {
        return { kind: 'current-project', args };
    }
    if (typeof projectRootArg !== 'string' || projectRootArg.trim().length === 0) {
        return {
            kind: 'failure',
            result: failureResult(toolName, 'projectRoot must be a non-empty absolute path string.', {
                errorCode: 'CODEX_INVALID_PROJECT_ROOT_ARGUMENT',
                required: { projectRoot: 'absolute path' },
            }),
        };
    }
    if (!isAbsolute(projectRootArg)) {
        return {
            kind: 'failure',
            result: failureResult(toolName, 'projectRoot must be an absolute path.', {
                errorCode: 'CODEX_INVALID_PROJECT_ROOT_ARGUMENT',
                received: projectRootArg,
                required: { projectRoot: 'absolute path' },
            }),
        };
    }
    const scopedArgs = { ...args };
    delete scopedArgs.projectRoot;
    const resolution = resolveCodexProjectRoot({ projectRoot: projectRootArg });
    return {
        kind: 'scoped-project',
        override: {
            args: scopedArgs,
            projectRoot: projectRootArg,
            resolution,
            trusted: isTrustedCodexProjectRoot(resolution),
        },
    };
}
export function persistTrustedCodexProjectRootScope(scope) {
    if (scope.trusted && scope.resolution.path) {
        writeCodexSavedProjectRoot(scope.resolution.path);
    }
}
