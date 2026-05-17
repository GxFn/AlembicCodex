/**
 * SourceFileCollector — 递归收集项目源文件
 *
 * 从 GuardHandler 提取的公共工具，供 ComplianceReporter / guard:ci / guard:staged 复用
 */
/** 支持审计的源文件扩展名 — 委托给 LanguageService */
export declare const SOURCE_EXTS: Readonly<Set<string>>;
/**
 * 递归收集目录下所有源文件路径
 * @param dir 根目录
 * @param [options.extensions] 允许的扩展名（默认 SOURCE_EXTS）
 * @param [options.skipDirs] 跳过的目录名（默认 SKIP_DIRS）
 * @param [options.maxFiles] 最大文件数量（默认无限制）
 * @returns 文件路径列表
 */
export declare function collectSourceFiles(dir: string, options?: {
    extensions?: Set<string>;
    skipDirs?: Set<string>;
    maxFiles?: number;
}): Promise<string[]>;
/**
 * 收集源文件并读取内容（带测试文件标记）
 * @param dir 根目录
 * @param options collectSourceFiles 选项
 * @returns { path, content, isTest }[]
 */
export declare function collectSourceFilesWithContent(dir: string, options?: {
    extensions?: Set<string>;
    skipDirs?: Set<string>;
    maxFiles?: number;
}): Promise<{
    path: string;
    content: string;
    isTest: boolean;
}[]>;
declare const _default: {
    collectSourceFiles: typeof collectSourceFiles;
    collectSourceFilesWithContent: typeof collectSourceFilesWithContent;
    SOURCE_EXTS: Readonly<Set<string>>;
};
export default _default;
