/**
 * @module RubyDslParser
 * @description Ruby DSL 轻量解析器 — 从 Boxfile / podspec 类文件中提取项目结构信息
 *
 * 不需要完整的 Ruby 解析器，使用正则 + 上下文状态机提取：
 *  - 层级 (layer) 声明与层间访问规则
 *  - 模块 (box) 声明（本地/远程）
 *  - 宿主应用信息
 *  - 模块级 spec 依赖/源文件路径
 *
 * 支持 EasyBox (Boxfile + *.boxspec) 和结构类似的自研工具。
 */
export interface ParsedModule {
    name: string;
    version: string;
    isLocal: boolean;
    localPath?: string;
    group?: string;
}
export interface ParsedLayer {
    name: string;
    order: number;
    accessibleLayers: string[];
    modules: ParsedModule[];
}
export interface ParsedProjectConfig {
    hostApp?: {
        name: string;
        version: string;
    };
    layers: ParsedLayer[];
    globalDependencies: ParsedModule[];
}
export interface ParsedModuleSpec {
    name: string;
    version: string;
    sources: string;
    dependencies: string[];
    publicHeaders: string[];
    deploymentTarget?: string;
}
/**
 * 解析 Boxfile 内容，提取层级、模块、宿主应用信息
 */
export declare function parseBoxfile(content: string): ParsedProjectConfig;
/**
 * 解析 boxspec/podspec 文件内容，提取模块元数据
 */
export declare function parseModuleSpec(content: string): ParsedModuleSpec;
