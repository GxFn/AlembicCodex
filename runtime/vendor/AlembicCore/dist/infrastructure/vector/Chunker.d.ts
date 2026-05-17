/**
 * Chunker v2 — 内容分块策略
 *
 * 支持 5 种策略：whole、section（按标题）、fixed（固定大小+重叠）、ast（语法感知）、auto（自适应）
 *
 * auto 策略决策树:
 *   content
 *     ├── estimateTokens() ≤ maxChunkTokens? → whole
 *     ├── isCode(language) && hasTreeSitterGrammar? → ast (ASTChunker)
 *     ├── isMarkdown()? → section (按标题分段)
 *     └── DEFAULT → fixed (固定大小 + 行边界对齐)
 */
import { estimateTokens } from '../../shared/token-utils.js';
export { estimateTokens };
declare const DEFAULT_MAX_CHUNK_TOKENS = 512;
declare const DEFAULT_OVERLAP_TOKENS = 50;
/**
 * 将内容分块
 * @param metadata { type, sourcePath, language, ... }
 * @param options { strategy, maxChunkTokens, overlapTokens, useAST }
 * @returns >}
 */
export declare function chunk(content: string, metadata?: Record<string, unknown>, options?: {
    strategy?: string;
    maxChunkTokens?: number;
    overlapTokens?: number;
    useAST?: boolean;
}): {
    content: string;
    metadata: Record<string, unknown>;
}[];
export { DEFAULT_MAX_CHUNK_TOKENS, DEFAULT_OVERLAP_TOKENS };
