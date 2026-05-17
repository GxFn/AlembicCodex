/**
 * @module lang-go
 * @description Go AST Walker 插件
 *
 * 提取: struct, interface, method (with receiver), function, field, import
 * 模式: Singleton (sync.Once), Factory (New*), Constructor (New*),
 *        Goroutine, Channel, Middleware (http.Handler chain)
 *
 * Phase 5: 新增 ImportRecord 结构化导入 + extractCallSites 调用点提取
 */
declare function walkGo(root: any, ctx: any): void;
declare function detectGoPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
/**
 * 从 Go AST root 提取所有调用点
 * 遍历 function_declaration / method_declaration 中的 block → call_expression
 */
declare function extractCallSitesGo(root: any, ctx: any, _lang: any): void;
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkGo;
    detectPatterns: typeof detectGoPatterns;
    extractCallSites: typeof extractCallSitesGo;
    extensions: string[];
};
export {};
