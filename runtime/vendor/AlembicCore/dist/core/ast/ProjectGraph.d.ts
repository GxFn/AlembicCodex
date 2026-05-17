/**
 * @module ProjectGraph
 * @description 基于 Tree-sitter 的项目结构图 - v3.0 AI-First Bootstrap 核心组件
 *
 * 职责:
 * 1. 扫描项目源码文件 → 调用 AstAnalyzer 解析
 * 2. 构建 类/协议/Category 的查询索引
 * 3. 提供查询 API 供 Analyst Agent 工具调用
 *
 * 生命周期:
 * - 在 Bootstrap Phase 1 一次性构建 (ProjectGraph.build())
 * - 所有维度共享同一个实例
 * - 构建后只读
 */
export default class ProjectGraph {
    #private;
    /**
     * 扫描项目并构建 ProjectGraph
     * @param projectRoot 项目根目录
     * @param [options.extensions] 例如 ['.m', '.h', '.swift']
     * @param [options.onProgress] (parsed, total) => void
     */
    static build(projectRoot: any, options?: any): Promise<ProjectGraph>;
    /** 获取类的完整信息 */
    getClassInfo(className: any): any;
    /** 获取协议定义 + 所有遵循者 */
    getProtocolInfo(protocolName: any): any;
    /**
     * 获取继承链 (向上到根类)
     * @returns [className, parent, grandparent, ...]
     */
    getInheritanceChain(className: any): any[];
    /** 获取直接子类 */
    getSubclasses(className: any): any[];
    /** 递归获取所有后代类 */
    getAllDescendants(className: any): any[];
    /** 获取类的所有 Category 扩展 */
    getCategoryExtensions(className: any): any;
    /**
     * 查找覆写了指定方法的所有后代类
     * @param methodName 方法名或 selector
     */
    getMethodOverrides(className: any, methodName: any): {
        className: any;
        method: any;
        filePath: any;
    }[];
    /** 获取类的所有方法 */
    getClassMethods(className: any): any;
    /** 获取文件的符号摘要 */
    getFileSymbols(relativePath: any): any;
    /**
     * 获取所有已解析的文件路径
     * @returns 相对路径列表
     */
    getAllFilePaths(): any[];
    /** 搜索类名 (模糊匹配) */
    searchClasses(query: any, limit?: number): any[];
    /** 获取项目概览统计 */
    getOverview(): any;
    /** 获取所有类名 */
    getAllClassNames(): any[];
    /** 获取所有协议名 */
    getAllProtocolNames(): any[];
    /** 序列化为可 JSON.stringify 的纯对象 */
    toJSON(): {
        projectRoot: any;
        buildTimeMs: number;
        classes: {
            [k: string]: any;
        };
        protocols: {
            [k: string]: any;
        };
        categories: {
            [k: string]: any;
        };
        inheritance: {
            [k: string]: any;
        };
        conformance: Record<string, any>;
        files: {
            [k: string]: any;
        };
        methodsByClass: {
            [k: string]: any;
        };
    };
    /**
     * 从缓存数据恢复 ProjectGraph 实例
     * @param data toJSON() 输出的对象
     */
    static fromJSON(data: any): ProjectGraph;
    /**
     * 增量更新：仅重新解析变更文件，合并到现有图中
     * @param changedPaths 变更文件的绝对路径
     * @param deletedPaths 删除文件的相对路径
     * @returns >}
     */
    incrementalUpdate(changedPaths: any, deletedPaths?: any[], options?: any): Promise<{
        added: number;
        updated: number;
        deleted: number;
    }>;
}
