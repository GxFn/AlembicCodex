/**
 * @module lang-javascript
 * @description JavaScript AST Walker 插件
 *
 * 与 TypeScript walker 共享大部分逻辑，grammar 使用 web-tree-sitter (WASM)
 */
declare function walkJavaScript(root: any, ctx: any): void;
declare function detectJSPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkJavaScript;
    detectPatterns: typeof detectJSPatterns;
    extensions: string[];
};
export {};
