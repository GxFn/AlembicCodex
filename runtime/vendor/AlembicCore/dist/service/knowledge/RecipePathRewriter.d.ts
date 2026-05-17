/**
 * RecipePathRewriter — 统一的 Recipe 路径重写服务
 *
 * 将 rename（oldPath → newPath）写入 Recipe 的所有文本字段 + .md 文件。
 * 被 FileChangeHandler（实时修复）和 SourceRefReconciler（批量兜底修复）共享。
 *
 * 更新范围：
 *   1. reasoning.sources 数组项
 *   2. content.markdown 全文
 *   3. coreCode 全文
 *   4. .md 源文件（磁盘）
 *
 * @module service/knowledge/RecipePathRewriter
 */
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
export interface PathRename {
    oldPath: string;
    newPath: string;
}
export interface RewriteResult {
    /** 被更新的 DB 字段名列表 */
    updatedFields: string[];
    /** .md 文件是否被更新 */
    mdFileUpdated: boolean;
}
/**
 * 将一组路径 rename 应用到 Recipe 的所有文本字段和 .md 源文件。
 *
 * @param knowledgeRepo  KnowledgeRepository 实例
 * @param recipeId       目标 Recipe ID
 * @param renames        路径变更列表（支持批量）
 * @param baseDir        .md 文件的根目录（用于 resolve sourceFile 相对路径）
 */
export declare function rewriteRecipePaths(knowledgeRepo: KnowledgeRepositoryImpl, recipeId: string, renames: PathRename[], baseDir: string): Promise<RewriteResult>;
