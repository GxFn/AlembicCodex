/**
 * @module lang-kotlin
 * @description Kotlin AST Walker 插件
 *
 * 提取: class, interface, object, enum, sealed class, function, property, import, annotation
 * 模式: Singleton (object), Factory (companion), DSL, Flow, Sealed
 */
declare function walkKotlin(root: any, ctx: any): void;
declare function detectKtPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
/** 从 Kotlin AST root 提取所有调用点 */
declare function extractCallSitesKotlin(root: any, ctx: any, _lang: any): void;
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkKotlin;
    detectPatterns: typeof detectKtPatterns;
    extractCallSites: typeof extractCallSitesKotlin;
    extensions: string[];
};
export {};
