/**
 * @module lang-swift
 * @description Swift AST Walker 插件 - 从 AstAnalyzer.js 迁移
 *
 * Phase 5: 新增 ImportRecord 结构化导入 + extractCallSites 调用点提取
 */
declare function walkSwift(root: any, ctx: any): void;
declare function detectSwiftPatterns(root: any, _lang: any, methods: any, properties: any, classes: any): any[];
/**
 * 从 Swift AST root 提取所有调用点
 * 遍历 function_declaration 中的 function_body → call_expression
 */
declare function extractCallSitesSwift(root: any, ctx: any, _lang: any): void;
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkSwift;
    detectPatterns: typeof detectSwiftPatterns;
    extractCallSites: typeof extractCallSitesSwift;
    extensions: string[];
};
export {};
