/**
 * LangChain / Agent Enhancement Pack
 * 条件: { languages: ['python'], frameworks: ['langchain'] }
 *
 * 覆盖 LLM Agent 开发生态:
 *   - LangChain Chain / Agent / Tool
 *   - RAG Pipeline (Retriever → Splitter → Embedding → VectorStore)
 *   - Prompt Template / Output Parser
 *   - LlamaIndex Query Engine
 *   - 多轮对话 Memory
 *   - Streaming / Callback
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class LangChainEnhancement extends EnhancementPack {
    get id(): string;
    get displayName(): string;
    get conditions(): {
        languages: string[];
        frameworks: string[];
    };
    getExtraDimensions(): {
        id: string;
        label: string;
        guide: string;
        tierHint: number;
        knowledgeTypes: string[];
        skillWorthy: boolean;
        dualOutput: boolean;
        skillMeta: {
            name: string;
            description: string;
        };
    }[];
    getGuardRules(): {
        ruleId: string;
        category: string;
        dimension: string;
        severity: string;
        languages: string[];
        pattern: RegExp;
        message: string;
    }[];
    detectPatterns(astSummary: AstSummary): DetectedPattern[];
}
export declare const pack: LangChainEnhancement;
export {};
