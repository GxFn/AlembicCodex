/**
 * RecipeParser — Recipe Markdown 解析器
 * 从完整 Recipe MD 提取结构化数据
 */
interface CodeBlock {
    language: string;
    code: string;
}
export interface ParsedRecipe {
    title: string;
    summary: string;
    description: string;
    trigger: string;
    category: string;
    language: string;
    code: string;
    codeBlocks: CodeBlock[];
    usageGuide: string;
    headers: string[];
    includeHeaders: boolean;
    frontmatter: Record<string, unknown>;
    [key: string]: unknown;
}
interface ExtractOpts {
    projectRoot?: string;
    language?: string;
    relativePath?: string;
}
export declare class RecipeParser {
    #private;
    /**
     * 检查文本是否为完整 Recipe MD
     * 需包含: frontmatter + 代码块 + Usage Guide
     */
    isCompleteRecipe(text: string): boolean;
    /** 检查是否为「仅介绍」Recipe（有 frontmatter 但无代码块） */
    isIntroOnly(text: string): boolean;
    /** 解析完整 Recipe MD 为结构化对象 */
    parse(text: string): ParsedRecipe | null;
    /** 从文本中解析多段 Recipe（按 `---` 分隔） */
    parseAll(text: string): ParsedRecipe[];
    /** 解析 frontmatter YAML */
    parseFrontmatter(text: string): Record<string, unknown>;
    /** 从内容提取 trigger */
    getTrigger(text: string): string;
    /**
     * 从文件路径读取并提取 Recipe 候选
     * @param relativePath 相对路径
     * @param [opts.projectRoot] 项目根目录
     * @returns >}
     */
    extractFromPath(relativePath: string, opts?: ExtractOpts): Promise<{
        items: ParsedRecipe[];
        isMarked: boolean;
    }>;
    /** 从文本解析 Recipe（优先完整 Markdown 格式） */
    parseFromText(text: string, opts?: ExtractOpts): Promise<ParsedRecipe | ParsedRecipe[]>;
    /** 从文本提取代码片段（兜底方法，不要求 Markdown 格式） */
    extractFromText(text: string, opts?: ExtractOpts): Promise<ParsedRecipe | ParsedRecipe[]>;
}
export {};
