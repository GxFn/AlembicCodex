/**
 * @module YamlConfigParser
 * @description YAML 配置解析器 — 从 XcodeGen project.yml 中提取项目结构信息
 *
 * 支持解析：
 *  - targets（构建目标）及其依赖关系
 *  - settings（项目级/目标级构建设置）
 *  - schemes（构建方案）
 *  - sources（源文件路径）
 *
 * 使用 js-yaml 进行安全解析（禁用危险的 YAML 特性）。
 */
import type { ParsedModuleSpec, ParsedProjectConfig } from './RubyDslParser.js';
/**
 * 解析 XcodeGen project.yml 内容
 * 返回与 RubyDslParser 兼容的 ParsedProjectConfig
 */
export declare function parseXcodeGenProject(content: string): ParsedProjectConfig;
/**
 * 解析单个 target 为 ParsedModuleSpec 格式
 */
export declare function parseXcodeGenTarget(targetName: string, content: string): ParsedModuleSpec | null;
/**
 * 提取所有 target 的依赖图
 * 返回 [from, to][] 形式的有向边列表
 */
export declare function extractXcodeGenDependencyEdges(content: string): Array<[string, string]>;
export interface ParsedMelosProject {
    name: string;
    packageGlobs: string[];
    scripts: string[];
}
/**
 * 解析 melos.yaml 内容
 * 提取项目名、包路径 glob 模式、scripts 列表
 */
export declare function parseMelosProject(content: string): ParsedMelosProject;
