/**
 * IndexingPipeline v2 — 索引管线
 * scan → chunk (AST / section / fixed) → detect incremental changes (sourceHash) → batch embed → batch upsert
 *
 * v2 变更:
 * - 集成 BatchEmbedder: 批量 embed 替代串行 per-chunk embed, ~50× 加速
 * - 集成 Chunker v2: auto 策略自动选择 AST / section / fixed 分块
 * - 新增 onProgress 回调支持
 * - 新增 chunking 配置透传 (strategy, maxChunkTokens, overlapTokens, useAST)
 */
import type { VectorStore } from './VectorStore.js';
/** Chunk enrichment 接口 (可选, 由外层 service adapter 注入) */
interface ChunkEnricherLike {
    enrichChunks(document: {
        title: string;
        content: string;
        kind: string;
        sourcePath?: string;
    }, chunks: Array<{
        content: string;
        metadata: Record<string, unknown>;
    }>): Promise<Array<{
        content: string;
        metadata: Record<string, unknown>;
    }>>;
}
export declare class IndexingPipeline {
    #private;
    constructor(options?: {
        vectorStore?: VectorStore;
        aiProvider?: {
            embed: (texts: string | string[]) => Promise<number[] | number[][]>;
        };
        scanDirs?: string[];
        projectRoot?: string;
        batchSize?: number;
        maxConcurrency?: number;
        contextualEnricher?: ChunkEnricherLike | null;
        chunking?: {
            strategy?: string;
            maxChunkTokens?: number;
            overlapTokens?: number;
            useAST?: boolean;
        };
    });
    setVectorStore(store: VectorStore): void;
    setAiProvider(provider: {
        embed: (texts: string | string[]) => Promise<number[] | number[][]>;
    } | null): void;
    setContextualEnricher(enricher: ChunkEnricherLike | null): void;
    /**
     * 运行完整索引管线
     * @param options { force: boolean, dryRun: boolean, onProgress: function }
     * @returns >}
     */
    run(options?: {
        force?: boolean;
        dryRun?: boolean;
        clear?: boolean;
        onProgress?: (info: {
            phase: string;
            [key: string]: unknown;
        }) => void;
    }): Promise<{
        scanned: number;
        chunked: number;
        enriched: number;
        embedded: number;
        upserted: number;
        skipped: number;
        errors: number;
    }>;
    /**
     * 扫描项目中的可索引文件
     * @returns >}
     */
    scan(): {
        absolutePath: string;
        relativePath: string;
        type: string;
    }[];
    /** 计算内容 hash */
    hashContent(content: string): string;
}
export {};
