/**
 * RecipeExtractor — Recipe 内容提取器
 * 从 Markdown 文件提取 Recipe 元数据、代码块、语义标签、质量评分
 */
interface ExtractorOptions {
    extractSemanticTags?: boolean;
    analyzeCodeQuality?: boolean;
    computeQualityScore?: boolean;
    contentHashEnabled?: boolean;
}
interface CodeBlock {
    language: string;
    code: string;
    startIndex: number;
}
export declare class RecipeExtractor {
    #private;
    constructor(options?: ExtractorOptions);
    /** 从文件提取 Recipe */
    extractFromFile(filePath: string): {
        id: string;
        title: string;
        language: string;
        category: string;
        code: string;
        description: string;
        content: string;
        filePath: string;
        codeBlocks: CodeBlock[];
        semanticTags: string[];
        quality: {};
        contentHash: string | null;
        metadata: {
            filename: string;
            extractedAt: number;
        };
    } | null;
    /** 从内容提取 Recipe */
    extractFromContent(content: string, filename?: string, filePath?: string): {
        id: string;
        title: string;
        language: string;
        category: string;
        code: string;
        description: string;
        content: string;
        filePath: string;
        codeBlocks: CodeBlock[];
        semanticTags: string[];
        quality: {};
        contentHash: string | null;
        metadata: {
            filename: string;
            extractedAt: number;
        };
    };
}
export {};
