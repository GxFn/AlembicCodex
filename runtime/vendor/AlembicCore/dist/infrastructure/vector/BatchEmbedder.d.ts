/**
 * BatchEmbedder — 批量 embedding, 支持背压控制
 *
 * 利用 OpenAI/Gemini 的批量 embed API:
 * - OpenAI: embed(string[]) → number[][]
 * - Gemini: batchEmbedContents → 批量请求
 *
 * 使用 p-limit 并发控制, 避免 API 限流:
 * - 每批 batchSize (默认 32) 条文本
 * - 最多 maxConcurrency (默认 2) 个批次并行
 *
 * 性能: 100 chunks × 串行 300ms = 30s → 批量 ≈ 0.6s (50× 加速)
 *
 * @module infrastructure/vector/BatchEmbedder
 */
export declare class BatchEmbedder {
    #private;
    /** @param aiProvider AI Provider (需实现 embed(text|string[]) 方法) */
    constructor(aiProvider: {
        embed: (text: string | string[]) => Promise<number[] | number[][]>;
    }, options?: {
        batchSize?: number;
        maxConcurrency?: number;
    });
    /**
     * 批量 embed 文本
     *
     * @param items
     * @param [onProgress] (embedded, total) => void
     * @returns id → vector
     */
    embedAll(items: Array<{
        id: string;
        content: string;
    }>, onProgress?: (embedded: number, total: number) => void): Promise<Map<any, any>>;
}
