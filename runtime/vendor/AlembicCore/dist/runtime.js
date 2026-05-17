import { resolveFolderNames, } from './shared/folder-names.js';
export function createAlembicRuntime(options) {
    const projectRoot = normalizeRequiredPath(options.projectRoot, 'projectRoot');
    const dataRoot = options.dataRoot
        ? normalizeRequiredPath(options.dataRoot, 'dataRoot')
        : projectRoot;
    return {
        projectRoot,
        dataRoot,
        folderNames: resolveFolderNames(options.folderNames),
    };
}
function normalizeRequiredPath(value, label) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${label} must be a non-empty path`);
    }
    return value;
}
