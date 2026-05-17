/**
 * @module ImportPathResolver
 * @description Phase 5: 将 import 路径解析为项目内文件路径
 *
 * 负责:
 *   - 相对路径 (./ ../) 解析
 *   - 文件扩展名补全 (.ts, .js, .py, ...)
 *   - index 文件约定 (./dir → ./dir/index.ts)
 *   - 外部依赖识别与过滤
 *   - tsconfig paths alias 支持 (@/xxx → src/xxx)
 *
 * 不负责:
 *   - webpack resolve alias (需额外配置)
 *   - Node.js exports map (需解析 package.json)
 */
export declare class ImportPathResolver {
    fileIndex: Map<string, string>;
    pathAliases: Array<{
        prefix: string;
        targets: string[];
    }>;
    projectRoot: string;
    /**
     * @param projectRoot 项目根目录
     * @param allFiles 项目内所有文件的相对路径
     */
    constructor(projectRoot: string, allFiles: string[]);
    /**
     * 从 tsconfig.json 加载 paths alias 配置
     */
    _loadTsconfigPaths(projectRoot: string): void;
    /**
     * 解析 import 路径到项目文件
     *
     * @param importPath 如 "./UserRepo" 或 "../shared/utils"
     * @param importerFile 当前文件路径 (相对路径)
     * @returns 解析后的文件路径 (相对) 或 null (外部依赖)
     */
    resolve(importPath: string | {
        toString(): string;
    }, importerFile: string): string | null | undefined;
    /**
     * 尝试通过 tsconfig paths alias 解析
     */
    _resolveAlias(importPath: string): string | null;
    /** 判断是否为外部依赖 */
    _isExternal(importPath: string): boolean;
}
export default ImportPathResolver;
