export { DEFAULT_FOLDER_NAMES, resolveFolderNames, validateFolderNameSegment, } from './shared/folder-names.js';
export { DEFAULT_KNOWLEDGE_BASE_DIR, DEFAULT_SUB_REPO_DIR, detectKnowledgeBaseDir, isAlembicProject, isGitRepo, PROJECT_MARKER_DIRS, RUNTIME_DIR, readSubRepoDirFromConfig, readSubRepoUrlFromConfig, resolveSubRepoPath, SPEC_FILENAME, } from './shared/ProjectMarkers.js';
export { generateProjectId, getGhostWorkspaceDir, getProjectRegistryDir, getProjectRegistryPath, normalizeProjectPath, ProjectRegistry, } from './shared/ProjectRegistry.js';
export { resolveDataRoot, resolveKnowledgeScanDirs, resolveProjectRoot, resolveWorkspace, } from './shared/resolveProjectRoot.js';
export { WorkspaceResolver } from './shared/WorkspaceResolver.js';
