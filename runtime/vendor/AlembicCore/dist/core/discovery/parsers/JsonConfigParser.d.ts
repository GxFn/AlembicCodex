/**
 * @module JsonConfigParser
 * @description JSON 配置文件解析器 — 支持 Nx project.json、Flutter 插件依赖、React Native 检测
 *
 * 每个解析函数接受文件内容字符串，返回类型化结果。
 */
export interface ParsedNxWorkspace {
    projects: NxProject[];
}
export interface NxProject {
    name: string;
    root: string;
    projectType: string;
    tags: string[];
}
export interface ParsedFlutterPluginsDeps {
    plugins: FlutterPlugin[];
    flutterSdkVersion?: string;
}
export interface FlutterPlugin {
    name: string;
    path: string;
    platform: string;
}
export interface ParsedReactNativeProject {
    isReactNative: boolean;
    name: string;
    rnVersion?: string;
    hasFabric?: boolean;
    hasTurboModules?: boolean;
}
/**
 * 解析 Nx project.json 内容
 * 每个 project.json 描述一个项目
 */
export declare function parseNxWorkspace(content: string): ParsedNxWorkspace;
/**
 * 解析 .flutter-plugins-dependencies 文件内容
 * 该文件由 Flutter 工具链自动生成
 */
export declare function parseFlutterPluginsDeps(content: string): ParsedFlutterPluginsDeps;
/**
 * 解析 package.json 内容，判断是否是 React Native 项目
 */
export declare function parseReactNativeProject(content: string): ParsedReactNativeProject;
