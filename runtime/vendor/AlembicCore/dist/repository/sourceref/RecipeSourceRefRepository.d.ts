/**
 * RecipeSourceRefRepository — recipe_source_refs 表 CRUD (Drizzle ORM)
 *
 * Recipe 来源引用桥接表：建立 Recipe ↔ 源码文件的映射关系。
 * 表使用复合主键 (recipe_id, source_path)，没有独立 id 列。
 *
 * 主要消费者：SourceRefReconciler
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
export interface RecipeSourceRefEntity {
    recipeId: string;
    sourcePath: string;
    status: string;
    newPath: string | null;
    verifiedAt: number;
}
export interface RecipeSourceRefInsert {
    recipeId: string;
    sourcePath: string;
    status?: string;
    newPath?: string | null;
    verifiedAt: number;
}
export declare class RecipeSourceRefRepositoryImpl {
    #private;
    constructor(drizzle: DrizzleDB);
    /** 按 Recipe ID 查询所有关联的源引用 */
    findByRecipeId(recipeId: string): RecipeSourceRefEntity[];
    /** 按源文件路径查询所有关联的引用 */
    findBySourcePath(sourcePath: string): RecipeSourceRefEntity[];
    /** 按状态查询 */
    findByStatus(status: string): RecipeSourceRefEntity[];
    /** 查找指定复合键 */
    findOne(recipeId: string, sourcePath: string): RecipeSourceRefEntity | null;
    /** 查询所有 stale 引用 */
    findStale(): RecipeSourceRefEntity[];
    /** 统计条数 */
    count(): number;
    /** UPSERT — 插入或更新（按复合主键） */
    upsert(data: RecipeSourceRefInsert): void;
    /** 更新状态 */
    updateStatus(recipeId: string, sourcePath: string, status: string, newPath?: string): boolean;
    /** 按 Recipe ID 删除所有关联引用 */
    deleteByRecipeId(recipeId: string): number;
    /** 删除指定复合键 */
    deleteOne(recipeId: string, sourcePath: string): boolean;
    /** 检查表是否可访问（SourceRefReconciler 使用） */
    isAccessible(): boolean;
    /** Stale counts grouped by recipe (for SourceRefReconciler signal emission) */
    getStaleCountsByRecipe(): Array<{
        recipeId: string;
        staleCount: number;
        totalCount: number;
    }>;
    /** Find all entries with status='renamed' and non-null new_path */
    findRenamed(): RecipeSourceRefEntity[];
    /** Replace source path (updates composite key column) — used by SourceRefReconciler.applyRepairs */
    replaceSourcePath(recipeId: string, oldSourcePath: string, newSourcePath: string, verifiedAt: number): void;
    /** 查询多个 Recipe 的非 stale 来源引用（SearchEngine _supplementDetails 用） */
    findActiveByRecipeIds(ids: string[]): {
        recipeId: string;
        sourcePath: string;
        status: string;
        newPath: string | null;
    }[];
}
