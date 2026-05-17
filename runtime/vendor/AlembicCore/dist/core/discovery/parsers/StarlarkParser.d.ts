/**
 * @module StarlarkParser
 * @description Starlark (Python 子集) 轻量解析器 — 从 BUILD / BUILD.bazel / BUCK 文件提取构建目标信息
 *
 * 支持解析：
 *  - load() 语句 → 推断语言
 *  - 目标声明 (swift_library, cc_binary, java_library 等)
 *  - name / deps / srcs / visibility 字段
 *
 * 设计策略: 正则 + 逐行状态机（不做宏展开）
 */
export interface StarlarkTarget {
    rule: string;
    name: string;
    srcs: string[];
    deps: string[];
    visibility: string[];
    testonly?: boolean;
}
export interface LoadStatement {
    repository: string;
    path: string;
    symbols: string[];
}
export interface ParsedBuildFile {
    targets: StarlarkTarget[];
    loads: LoadStatement[];
}
export declare const RULE_TO_LANGUAGE: Record<string, string>;
/**
 * 解析单个 BUILD/BUILD.bazel/BUCK 文件内容
 */
export declare function parseStarlarkBuildFile(content: string): ParsedBuildFile;
