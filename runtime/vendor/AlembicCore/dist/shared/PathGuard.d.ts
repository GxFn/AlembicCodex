/**
 * PathGuard — 文件写入路径安全守卫（双层防护）
 *
 * 防止 Alembic 在项目目录之外 或 项目内非法位置 创建文件。
 * BiliDemo/data 事件的根因：process.cwd() 解析到非预期目录，DB/日志等写操作
 * 逃逸到用户项目外，创建了脏数据。
 *
 * 双层防护：
 *  Layer 1 — assertSafe(path):
 *    边界检查，拦截写到 projectRoot 外的操作
 *  Layer 2 — assertProjectWriteSafe(path):
 *    项目内作用域检查，仅允许写入以下前缀：
 *      .asd/     — 运行时 DB、记忆、对话、信号快照
 *      {kbDir}/          — 知识库（recipes、candidates、skills、guard 文件）
 *      .gitignore        — 追加忽略规则
 *    项目内其他位置（如 data/、src/ 等）一律拦截
 *
 * 设计：
 *  - 单例模式，通过 configure() 绑定 projectRoot
 *  - 新建文件/目录前调用 assertProjectWriteSafe() 校验
 *  - 修改已有文件前调用 assertSafe() 校验（不限制项目内位置）
 *  - 允许白名单目录（Xcode snippets、全局缓存等）
 *  - 错误不静默：越界写操作抛出 PathGuardError
 */
export declare class PathGuardError extends Error {
    projectRoot: string;
    targetPath: string;
    /**
     * @param targetPath 被拦截的目标路径
     * @param projectRoot 当前项目根目录
     * @param [reason] 拦截原因
     */
    constructor(targetPath: string, projectRoot: string, reason?: string);
}
export interface PathGuardConfigureOptions {
    projectRoot: string;
    packageRoot?: string;
    knowledgeBaseDir?: string;
    extraAllowPaths?: string[];
    /**
     * 宿主 adapter 可显式扩展项目内写入前缀。
     *
     * Core 默认只允许 runtime/knowledge 写入；Cursor、VSCode、GitHub 等交付目录
     * 必须由外层 delivery adapter 自己声明，避免交付渠道规则偷渡进 Core。
     */
    extraProjectWritePrefixes?: string[];
    /** 宿主 adapter 可显式扩展项目根可写文件。 */
    extraProjectWritableFiles?: string[];
}
declare class PathGuard {
    #private;
    targetPath: string | undefined;
    /**
     * 配置 PathGuard（每个进程执行一次）
     * @param opts.projectRoot 用户项目根目录（绝对路径）
     * @param [opts.packageRoot] Alembic 包自身根目录
     * @param [opts.knowledgeBaseDir='Alembic'] 知识库目录名
     * @param [opts.extraAllowPaths] 额外允许的路径前缀
     */
    configure({ projectRoot, packageRoot, knowledgeBaseDir, extraAllowPaths, extraProjectWritePrefixes, extraProjectWritableFiles, }: PathGuardConfigureOptions): void;
    /** 是否已配置 */
    get configured(): boolean;
    /** 当前 projectRoot */
    get projectRoot(): string | null;
    /**
     * 设置知识库目录名（可在 configure 之后延迟设置）
     * @param dirName 如 'Alembic'、'Knowledge' 等
     */
    setKnowledgeBaseDir(dirName: string): void;
    /**
     * Layer 1: 断言路径在允许的边界范围内
     * 用于修改已有文件的场景（如 XcodeIntegration 插入 header、SpmHelper 修改 Package.swift）
     * @param targetPath 要写入的绝对路径
     * @throws {PathGuardError}
     */
    assertSafe(targetPath: string): void;
    /**
     * Layer 2: 断言路径在项目内允许的写入作用域中
     * 用于创建新目录/新文件的场景（如 mkdirSync、writeFileSync 创建新文件）
     * 比 assertSafe() 更严格：即使在 projectRoot 内，也只允许写入特定前缀
     * @param targetPath 要创建的绝对路径
     * @throws {PathGuardError}
     */
    assertProjectWriteSafe(targetPath: string): void;
    /** 安全检查（不抛错，返回 boolean） */
    isSafe(targetPath: string): boolean;
    /** 项目内写入范围检查（不抛错，返回 boolean） */
    isProjectWriteSafe(targetPath: string): boolean;
    /**
     * 将相对路径安全地解析到 projectRoot 下
     * 替代 path.resolve(relativePath)（后者基于 cwd，不安全）
     * @returns 绝对路径
     */
    resolveProjectPath(relativePath: string): string;
    /** 重置状态（仅用于测试） */
    _reset(): void;
    /**
     * 动态添加白名单路径（Ghost 模式外置工作区目录）
     * 仅接受绝对路径
     */
    addAllowPath(absolutePath: string): void;
    /** 动态添加项目内写入前缀（外层 delivery adapter 使用） */
    addProjectWritePrefix(relativePrefix: string): void;
}
declare const pathGuard: PathGuard;
export default pathGuard;
