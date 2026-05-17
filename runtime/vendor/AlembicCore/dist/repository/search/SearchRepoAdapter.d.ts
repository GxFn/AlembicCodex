/**
 * SearchRepoAdapter — SearchEngine 用的轻量级仓储适配器
 *
 * 当完整的 KnowledgeRepositoryImpl / RecipeSourceRefRepositoryImpl 不可用时
 * （例如单元测试中只传入 raw db），SearchEngine 自动使用这些适配器。
 * 放在 lib/repository/ 下，允许使用 raw SQL（lint 白名单目录）。
 */
export interface SearchDb {
    prepare(sql: string): {
        all(...args: unknown[]): Record<string, unknown>[];
    };
}
/** 解包 DatabaseConnection → raw SearchDb（若已是 raw db 则直接返回） */
export declare function unwrapSearchDb(db: SearchDb & {
    getDb?: () => SearchDb;
}): SearchDb;
/**
 * 通用 db 解包：接受 raw db 或 { getDb() } wrapper，返回 raw db。
 * 可用于 SearchDb、DatabaseLike 等不同 db 类型的构造函数。
 */
export declare function unwrapRawDb<T>(db: T | (T & {
    getDb(): T;
})): T;
/** SearchEngine 需要的 KnowledgeRepo 最小接口 */
export interface SearchKnowledgeRepo {
    findNonDeprecatedSync(): Record<string, unknown>[];
    keywordSearchSync(pattern: string, limit: number): Record<string, unknown>[];
    findByIdsDetailSync(ids: string[]): Record<string, unknown>[];
    findUpdatedSinceSync(sinceIso: string): Record<string, unknown>[];
}
/** SearchEngine 需要的 SourceRefRepo 最小接口 */
export interface SearchSourceRefRepo {
    findActiveByRecipeIds(ids: string[]): Array<{
        recipeId: string;
        sourcePath: string;
        status: string;
        newPath: string | null;
    }>;
}
/**
 * Raw-db 适配器：实现 SearchKnowledgeRepo 接口
 * 仅在 KnowledgeRepositoryImpl 不可用时降级使用。
 */
export declare class RawDbKnowledgeAdapter implements SearchKnowledgeRepo {
    #private;
    constructor(db: SearchDb);
    findNonDeprecatedSync(): Record<string, unknown>[];
    keywordSearchSync(pattern: string, limit: number): Record<string, unknown>[];
    findByIdsDetailSync(ids: string[]): Record<string, unknown>[];
    findUpdatedSinceSync(sinceIso: string): Record<string, unknown>[];
}
/**
 * Raw-db 适配器：实现 SearchSourceRefRepo 接口
 * 仅在 RecipeSourceRefRepositoryImpl 不可用时降级使用。
 */
export declare class RawDbSourceRefAdapter implements SearchSourceRefRepo {
    #private;
    constructor(db: SearchDb);
    findActiveByRecipeIds(ids: string[]): {
        recipeId: string;
        sourcePath: string;
        status: string;
        newPath: string | null;
    }[];
}
/** GuardCheckEngine 需要的 KnowledgeRepo 最小接口 */
export interface GuardKnowledgeRepo {
    findGuardRulesSync(lifecycles: readonly string[]): Record<string, unknown>[];
    incrementGuardHitsSync(id: string, hits: number): void;
}
/**
 * Raw-db 适配器：实现 GuardKnowledgeRepo 接口
 * 仅在 KnowledgeRepositoryImpl 不可用时降级使用。
 */
export declare class RawDbGuardAdapter implements GuardKnowledgeRepo {
    #private;
    constructor(db: {
        prepare(sql: string): {
            all(...args: unknown[]): Record<string, unknown>[];
            run(...args: unknown[]): unknown;
        };
    });
    findGuardRulesSync(lifecycles: readonly string[]): Record<string, unknown>[];
    incrementGuardHitsSync(id: string, hits: number): void;
}
/** 从 raw db 查询非 deprecated 的基本条目信息（SyncCoordinator 对账用） */
export declare function queryNonDeprecatedEntries(db: {
    prepare(sql: string): {
        all(): Array<Record<string, unknown>>;
    };
}): Array<{
    id: string;
    title?: string;
    content?: string;
    kind?: string;
}>;
