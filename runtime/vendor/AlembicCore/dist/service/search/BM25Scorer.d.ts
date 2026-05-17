/**
 * BM25Scorer — BM25 全文检索评分器
 *
 * 从 SearchEngine.ts 提取的独立模块。
 * 支持增量 add/remove/update、tombstone 压缩、O(1) ID 查找。
 *
 * @module BM25Scorer
 */
import type { BM25Document, Scorer } from './SearchTypes.js';
/** BM25 评分器 */
export declare class BM25Scorer implements Scorer {
    _idIndex: Map<string, number>;
    _totalLength: number;
    avgLength: number;
    docFreq: Record<string, number>;
    documents: (BM25Document | null)[];
    totalDocs: number;
    constructor();
    /** 添加文档到索引 */
    addDocument(id: string, text: string, meta?: Record<string, unknown>): void;
    /**
     * 移除文档（增量删除）
     * 采用标记删除 + 懒清理策略：将文档标记为 null，当空洞率 > 30% 时自动压缩
     * @returns 是否成功移除
     */
    removeDocument(id: string): boolean;
    /** 更新文档（增量: remove + add） */
    updateDocument(id: string, text: string, meta?: Record<string, unknown>): void;
    /** 检查文档是否存在 */
    hasDocument(id: string): boolean;
    /** 压缩 documents 数组，清除 tombstone 空洞 */
    _compact(): void;
    /** 查询文档，返回按 BM25 分数排序的结果 */
    search(query: string, limit?: number): import("./SearchTypes.js").ScorerResult[];
    /** 清空索引 */
    clear(): void;
}
