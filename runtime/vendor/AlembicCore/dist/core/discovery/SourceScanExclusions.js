/**
 * ProjectScope cold-start 的源码扫描共享排除策略。
 *
 * 这些目录代表依赖、构建产物、缓存或 release snapshot，不属于日常
 * ProjectScope source folder 的真实源码输入。各语言 discoverer 可以追加
 * 自己的生态目录，但不能漏掉这里的共享集合。
 */
export const COMMON_SOURCE_SCAN_EXCLUDE_DIRS = [
    '.git',
    '.cursor',
    '.idea',
    '.vscode',
    'node_modules',
    '.venv',
    'venv',
    'Pods',
    'Carthage',
    'dist',
    'build',
    'out',
    '.build',
    'target',
    'DerivedData',
    '.cache',
    '.turbo',
    '.next',
    '.nuxt',
    '__pycache__',
    'coverage',
    'vendor',
];
export function createSourceScanExcludeDirs(extraDirs = []) {
    return new Set([...COMMON_SOURCE_SCAN_EXCLUDE_DIRS, ...extraDirs]);
}
export function isSourceScanExcludedDir(dirName, extraDirs = []) {
    return createSourceScanExcludeDirs(extraDirs).has(dirName);
}
