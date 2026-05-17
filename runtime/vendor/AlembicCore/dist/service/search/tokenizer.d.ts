/**
 * tokenizer — 中英文混合分词器
 *
 * 从 SearchEngine.ts 提取的独立分词模块。
 * 支持 camelCase/PascalCase 拆分 + CJK bigram 覆盖 + 停用词过滤。
 *
 * @module tokenizer
 */
/** 评分调参常量（原 BM25 k1/b 参数，BM25Scorer 仍在使用） */
export declare const BM25_K1 = 1.2;
export declare const BM25_B = 0.75;
/**
 * 分词: 中英文混合分词
 * 英文: camelCase / PascalCase 拆分 + 小写化 + 停用词过滤
 * 中文: bigram + 完整片段 — 停用词级别单字被过滤，无需分词词典即可支持子串匹配
 */
export declare function tokenize(text: string): string[];
