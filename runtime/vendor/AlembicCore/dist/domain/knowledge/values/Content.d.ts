/**
 * Content — 内容值对象
 *
 * 统一承载代码片段 (pattern) 或 Markdown 全文 (markdown)，
 * 以及设计原理、实施步骤、代码变更、验证方式。
 */
interface ContentProps {
    pattern?: string;
    markdown?: string;
    rationale?: string;
    steps?: Array<{
        title?: string;
        description?: string;
        code?: string;
    }>;
    codeChanges?: Array<{
        file: string;
        before: string;
        after: string;
        explanation: string;
    }>;
    verification?: {
        method?: string;
        expected_result?: string;
        test_code?: string;
    } | null;
}
export declare class Content {
    codeChanges: Array<{
        file: string;
        before: string;
        after: string;
        explanation: string;
    }>;
    markdown: string;
    pattern: string;
    rationale: string;
    steps: Array<{
        title?: string;
        description?: string;
        code?: string;
    }>;
    verification: {
        method?: string;
        expected_result?: string;
        test_code?: string;
    } | null;
    constructor(props?: ContentProps);
    /** 从任意输入构造 Content */
    static from(input: unknown): Content;
    /** 是否包含有效内容 */
    hasContent(): boolean;
    /** 转换为 wire format JSON */
    toJSON(): {
        pattern: string;
        markdown: string;
        rationale: string;
        steps: {
            title?: string;
            description?: string;
            code?: string;
        }[];
        codeChanges: {
            file: string;
            before: string;
            after: string;
            explanation: string;
        }[];
        verification: {
            method?: string;
            expected_result?: string;
            test_code?: string;
        } | null;
    };
    /** 从 wire format 创建 */
    static fromJSON(data: unknown): Content;
}
export default Content;
