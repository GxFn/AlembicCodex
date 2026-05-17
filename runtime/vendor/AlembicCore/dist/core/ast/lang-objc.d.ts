/**
 * @module lang-objc
 * @description ObjC AST Walker 插件 - 从 AstAnalyzer.js 迁移
 */
declare function walkObjC(root: any, ctx: any): void;
declare function detectObjCPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkObjC;
    detectPatterns: typeof detectObjCPatterns;
    extensions: string[];
};
export {};
