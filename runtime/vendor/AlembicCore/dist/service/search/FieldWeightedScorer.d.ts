/**
 * FieldWeightedScorer — 加权字段匹配评分器
 *
 * 替代 BM25Scorer 作为结构化知识库的默认搜索评分引擎。
 *
 * 设计动机:
 * - BM25 将所有字段拼接为文本做统计评分，tokenize 去重导致 TF 恒为 1，BM25F boost 失效
 * - 对于 ~50–500 条结构化知识条目，BM25 的大规模语料假设不成立
 * - FieldWeightedScorer 对每个字段独立打分并加权合并，精确匹配 > token 重叠 > IDF 加权
 *
 * 字段权重:
 *   trigger (5.0) > title (3.0) > tags (2.0) > description (1.5) > content (1.0) > facets (0.5)
 *
 * @module FieldWeightedScorer
 */
import type { BM25SearchResult, Scorer } from './SearchTypes.js';
/** 字段加权文档内部表示 */
interface FieldWeightedDocument {
    id: string;
    fields: {
        trigger: string;
        title: string;
        description: string;
        tags: string[];
        language: string;
        category: string;
        knowledgeType: string;
    };
    tokenizedFields: {
        trigger: string[];
        title: string[];
        description: string[];
        content: string[];
        allUnique: Set<string>;
    };
    meta: Record<string, unknown>;
}
/**
 * FieldWeightedScorer — 加权字段匹配评分器
 *
 * 接口与 BM25Scorer 完全兼容（实现 Scorer 接口），可作为 drop-in 替换。
 */
export declare class FieldWeightedScorer implements Scorer {
    avgLength: number;
    docFreq: Record<string, number>;
    documents: (FieldWeightedDocument | null)[];
    totalDocs: number;
    _idIndex: Map<string, number>;
    _totalLength: number;
    constructor();
    /** 添加文档到索引 */
    addDocument(id: string, text: string, meta?: Record<string, unknown>): void;
    /**
     * 移除文档（tombstone + 懒压缩）
     * @returns 是否成功移除
     */
    removeDocument(id: string): boolean;
    /** 更新文档（remove + add） */
    updateDocument(id: string, text: string, meta?: Record<string, unknown>): void;
    /** 检查文档是否存在 */
    hasDocument(id: string): boolean;
    /** 清空索引 */
    clear(): void;
    /** 压缩 documents 数组，清除 tombstone 空洞 */
    _compact(): void;
    /** 搜索：对每个文档按字段加权评分，返回降序结果 */
    search(query: string, limit?: number): BM25SearchResult[];
    /** 字符串级别匹配评分（用于 trigger / title） */
    _stringMatchScore(query: string, field: string): number;
    /** Token 集合重叠率（查询侧召回） */
    _tokenOverlap(queryTokens: string[], fieldTokens: string[]): number;
    /** IDF 加权 token overlap（用于长文本字段） */
    _idfWeightedOverlap(queryTokens: string[], fieldTokens: string[]): number;
    /** Tag 匹配评分 */
    _tagScore(queryTokens: string[], tags: string[]): number;
    /** Facet 匹配评分（language / category / knowledgeType） */
    _facetScore(queryTokens: string[], fields: FieldWeightedDocument['fields']): number;
    /** 计算 IDF（平滑，始终为正） */
    _idf(token: string): number;
}
export {};
