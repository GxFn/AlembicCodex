/**
 * Defaults — 项目级默认常量与配置
 * 统一管理路径名、存储适配器、索引策略、分类规则等默认值
 */
export declare const SPEC_FILENAME = "Alembic.boxspec.json";
export declare const KNOWLEDGE_BASE_DIR: string;
export declare const RECIPES_DIR: string;
export declare const CANDIDATES_DIR: string;
export declare const RECIPES_INDEX: string;
export declare const SPMMAP_FILENAME = "Alembic.spmmap.json";
export declare const SPMMAP_PATH: string;
/** 默认子仓库相对路径（相对于 projectRoot） */
export declare const SUB_REPO_DIR: string;
export declare const DEFAULT_STORAGE_ADAPTER = "json";
export declare const STORAGE_ADAPTERS: string[];
export declare const SOURCE_TYPES: string[];
export declare const SOURCE_TYPE_RECIPE = "recipe";
export declare const SOURCE_TYPE_TARGET_README = "target-readme";
export declare const DEFAULT_SOURCES: {
    path: string;
    type: string;
}[];
export declare const DEFAULT_CHUNKING: {
    strategy: string;
};
export declare const CHUNKING_STRATEGIES: string[];
export declare const DEFAULT_MAX_CHUNK_TOKENS = 800;
export declare const DEFAULT_OVERLAP_TOKENS = 80;
export declare const CHARS_PER_TOKEN = 3;
export declare const README_NAMES: string[];
export declare const DEFAULT_ALEMBIC_UI_URL = "http://localhost:3000";
export declare const GUARD_CONTEXT_EXCERPT_LIMIT = 12000;
export declare const CATEGORY_RULES: {
    pattern: RegExp;
    category: string;
}[];
export declare const DEFAULT_CATEGORY = "general";
/**
 * 从文件路径和内容推断 category
 * 优先读取 frontmatter 的 category 字段，其次匹配路径规则
 */
export declare function inferCategory(relPath: string, content: string): string;
declare const _default: {
    SPEC_FILENAME: string;
    KNOWLEDGE_BASE_DIR: string;
    RECIPES_DIR: string;
    CANDIDATES_DIR: string;
    RECIPES_INDEX: string;
    SPMMAP_FILENAME: string;
    SPMMAP_PATH: string;
    SUB_REPO_DIR: string;
    DEFAULT_STORAGE_ADAPTER: string;
    STORAGE_ADAPTERS: string[];
    SOURCE_TYPES: string[];
    SOURCE_TYPE_RECIPE: string;
    SOURCE_TYPE_TARGET_README: string;
    DEFAULT_SOURCES: {
        path: string;
        type: string;
    }[];
    DEFAULT_CHUNKING: {
        strategy: string;
    };
    CHUNKING_STRATEGIES: string[];
    DEFAULT_MAX_CHUNK_TOKENS: number;
    DEFAULT_OVERLAP_TOKENS: number;
    CHARS_PER_TOKEN: number;
    README_NAMES: string[];
    DEFAULT_ALEMBIC_UI_URL: string;
    GUARD_CONTEXT_EXCERPT_LIMIT: number;
    CATEGORY_RULES: {
        pattern: RegExp;
        category: string;
    }[];
    DEFAULT_CATEGORY: string;
    inferCategory: typeof inferCategory;
};
export default _default;
