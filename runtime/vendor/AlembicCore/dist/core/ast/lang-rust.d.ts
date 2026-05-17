/**
 * @module lang-rust
 * @description Rust AST Walker 插件
 *
 * 提取: struct, enum, trait, impl, function, method, mod, use, const/static
 * 模式: Builder, Newtype, Factory (new/from), Error Handling (Result/Option/?),
 *        Async (tokio/async-std), Unsafe block, Derive macro
 *
 * Phase 5: 新增 ImportRecord 结构化导入 + extractCallSites 调用点提取
 */
declare function walkRust(root: any, ctx: any): void;
declare function detectRustPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
/**
 * 从 Rust AST root 提取所有调用点
 * 遍历 function_item / impl method 中的 block → call_expression / method_call_expression
 */
declare function extractCallSitesRust(root: any, ctx: any, _lang: any): void;
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkRust;
    detectPatterns: typeof detectRustPatterns;
    extractCallSites: typeof extractCallSitesRust;
    extensions: string[];
};
export {};
