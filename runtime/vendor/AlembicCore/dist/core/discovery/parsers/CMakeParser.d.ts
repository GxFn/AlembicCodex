/**
 * @module CMakeParser
 * @description CMake 轻量解析器 — 从 CMakeLists.txt 提取项目拓扑
 *
 * 支持解析：
 *  - project() — 项目名和版本
 *  - add_subdirectory() — 子目录发现
 *  - add_library() / add_executable() — 目标声明
 *  - target_link_libraries() — 依赖关系
 *
 * 设计策略: 仅解析顶层调用，不跟踪控制流 (if/else/macro)
 */
export interface ParsedCMakeProject {
    projectName: string;
    version?: string;
    subdirectories: string[];
    targets: CMakeTarget[];
}
export interface CMakeTarget {
    name: string;
    type: 'executable' | 'static-library' | 'shared-library' | 'interface-library';
    sources: string[];
    linkDependencies: CMakeLinkDep[];
}
export interface CMakeLinkDep {
    target: string;
    scope: 'PUBLIC' | 'PRIVATE' | 'INTERFACE';
}
/**
 * 解析 CMakeLists.txt 内容
 */
export declare function parseCMakeProject(content: string): ParsedCMakeProject;
