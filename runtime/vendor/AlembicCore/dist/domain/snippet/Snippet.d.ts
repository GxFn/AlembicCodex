export interface SnippetProps {
    id?: string;
    identifier?: string;
    title?: string;
    language?: string;
    category?: string;
    completion?: string;
    summary?: string;
    code?: string | string[];
    targets?: Record<string, {
        installed?: boolean;
        path?: string | null;
    }>;
    installed?: boolean;
    installedPath?: string | null;
    sourceRecipeId?: string | null;
    sourceCandidateId?: string | null;
    metadata?: Record<string, unknown> | null;
    createdBy?: string | null;
    createdAt?: number;
    updatedAt?: number;
    [key: string]: unknown;
}
/**
 * Snippet - 代码片段实体
 *
 * 与 Recipe 的区别:
 * - Recipe: 抽象的知识模式 / 最佳实践
 * - Snippet: 具体的、可安装的代码片段（由各 IDE 插件适配安装目标）
 */
export declare class Snippet {
    category: string;
    code: string;
    completion: string;
    createdAt: number;
    createdBy: string | null;
    id: string;
    identifier: string;
    language: string;
    metadata: Record<string, unknown> | null;
    sourceCandidateId: string | null;
    sourceRecipeId: string | null;
    summary: string;
    targets: Record<string, {
        installed?: boolean;
        path?: string | null;
    }>;
    title: string;
    updatedAt: number;
    constructor(props: SnippetProps);
    /**
     * 是否已安装到指定插件目标 (不传则检查任意)
     */
    isInstalled(target?: string): boolean;
    /** 获取指定 IDE 的安装路径 */
    getInstalledPath(target: string): string | null;
    /** 验证 Snippet 完整性 */
    isValid(): boolean | "";
    /** 转换为 JSON（前端 / API 返回格式） */
    toJSON(): {
        id: string;
        identifier: string;
        title: string;
        language: string;
        category: string;
        completion: string;
        summary: string;
        code: string;
        targets: Record<string, {
            installed?: boolean;
            path?: string | null;
        }>;
        installed: boolean;
        sourceRecipeId: string | null;
        sourceCandidateId: string | null;
        metadata: Record<string, unknown> | null;
        createdBy: string | null;
        createdAt: number;
        updatedAt: number;
    };
    /** 从 JSON 创建 Snippet */
    static fromJSON(data: SnippetProps): Snippet;
}
export default Snippet;
