/**
 * Paths — 项目路径解析工具
 * 提供 Snippet 安装目录、缓存目录、知识库目录等路径计算能力。
 *
 * 设计原则：路径解析与目录创建分离
 *  - 路径 getter 函数仅返回路径字符串，不产生文件系统副作用
 *  - 需要创建目录时，调用方应使用 ensureDir() 显式确保目录存在
 *  - 全局非项目目录（Xcode snippets、cache）在获取时自动创建
 */
export declare const SPEC_FILENAME = "Alembic.boxspec.json";
/** 确保目录存在（静默处理异常），供写入前调用 */
export declare function ensureDir(dirPath: string): string;
/**
 * Xcode CodeSnippets 输出目录 (macOS only)
 * 可通过 ALEMBIC_SNIPPETS_PATH 环境变量覆盖
 * 非 macOS 返回全局缓存下的 snippets/ 子目录
 */
export declare function getSnippetsPath(): string;
/**
 * Alembic 全局缓存目录 ~/.asd/cache
 * 可通过 ALEMBIC_CACHE_PATH 环境变量覆盖
 */
export declare function getCachePath(): string;
/**
 * 获取包含 Alembic.boxspec.json 的子目录名称
 * 委托 ProjectMarkers.detectKnowledgeBaseDir() 统一探测逻辑
 * @returns 知识库目录名（默认 'Alembic'）
 */
export declare function getKnowledgeBaseDirName(projectRoot: string): string;
/**
 * 知识库根目录 = projectRoot/{dirContainingBoxspec}
 * 注意：仅返回路径，不创建目录
 */
export declare function getProjectKnowledgePath(projectRoot: string): string;
/** Spec 文件路径 = knowledgePath/Alembic.boxspec.json */
export declare function getProjectSpecPath(projectRoot: string): string;
/**
 * 项目内部隐藏数据目录 = knowledgePath/.asd
 * 注意：仅返回路径，不创建目录
 */
export declare function getProjectInternalDataPath(projectRoot: string): string;
/**
 * 上下文存储目录 = internalData/context
 * 注意：仅返回路径，不创建目录
 */
export declare function getContextStoragePath(projectRoot: string): string;
/**
 * 上下文索引目录 = contextStorage/index
 * 注意：仅返回路径，不创建目录
 */
export declare function getContextIndexPath(projectRoot: string): string;
/**
 * 项目级 Skills 目录 = knowledgePath/skills
 * Skills 放在知识库目录下跟随项目走（Git-tracked，用户可见）
 * 注意：仅返回路径，不创建目录
 */
export declare function getProjectSkillsPath(projectRoot: string): string;
/**
 * Recipes 目录
 * 优先使用 rootSpec.recipes.dir / rootSpec.skills.dir（兼容旧配置）
 * @param [rootSpec] 项目 spec 对象（可选）
 */
export declare function getProjectRecipesPath(projectRoot: string, rootSpec?: {
    recipes?: {
        dir?: string;
    };
    skills?: {
        dir?: string;
    };
}): string;
declare const _default: {
    SPEC_FILENAME: string;
    ensureDir: typeof ensureDir;
    getSnippetsPath: typeof getSnippetsPath;
    getCachePath: typeof getCachePath;
    getKnowledgeBaseDirName: typeof getKnowledgeBaseDirName;
    getProjectKnowledgePath: typeof getProjectKnowledgePath;
    getProjectSpecPath: typeof getProjectSpecPath;
    getProjectInternalDataPath: typeof getProjectInternalDataPath;
    getProjectSkillsPath: typeof getProjectSkillsPath;
    getContextStoragePath: typeof getContextStoragePath;
    getContextIndexPath: typeof getContextIndexPath;
    getProjectRecipesPath: typeof getProjectRecipesPath;
};
export default _default;
