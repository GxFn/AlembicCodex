/**
 * KnowledgeFileWriter — 将 KnowledgeEntry 序列化为 .md 文件 / 从 .md 解析回实体
 *
 * 统一替代 CandidateFileWriter + RecipeFileWriter。
 *
 * 职责：
 *  - KnowledgeEntry → YAML frontmatter + Markdown body  (serialize)
 *  - .md 内容 → wire format JSON → KnowledgeEntry.fromJSON()  (parse)
 *  - 落盘到 Alembic/{candidates|recipes}/{category}/ 目录
 *  - .md 文件 = 完整唯一数据源（Source of Truth），DB = 索引缓存
 *
 * Frontmatter 分层：
 *  - 标量字段（人类可读/可编辑）：id, title, lifecycle, language, ...
 *  - 简单数组字段（行内 JSON）：tags, headers, headerPaths
 *  - 值对象（_ 前缀，单行 JSON）：_content, _relations, _constraints, ...
 *
 * 文件名策略：trigger slug > title slug > id[:8]
 * 落盘目录：isCandidate() → candidates/  |  isActive()/deprecated → recipes/
 */
import type { KnowledgeEntry } from '../../domain/knowledge/KnowledgeEntry.js';
import type { WriteZone } from '../../infrastructure/io/WriteZone.js';
import Logger from '../../infrastructure/logging/Logger.js';
import type { KnowledgeFileStore } from '../../repository/knowledge/KnowledgeFileStore.js';
export declare class KnowledgeFileWriter implements KnowledgeFileStore {
    #private;
    candidatesDir: string;
    logger: ReturnType<typeof Logger.getInstance>;
    projectRoot: string;
    recipesDir: string;
    constructor(projectRoot: string, writeZone?: WriteZone);
    /** 将 KnowledgeEntry 序列化为完整 .md（YAML frontmatter + body） */
    serialize(entry: KnowledgeEntry): string;
    /** 构建 Markdown body */
    _buildBody(entry: KnowledgeEntry): string;
    /**
     * 将 KnowledgeEntry 落盘到对应目录
     * - isCandidate() → Alembic/candidates/{dimensionId|category}/
     * - isActive()/deprecated → Alembic/recipes/{dimensionId|category}/
     *
     * @returns 写入的文件路径，失败返回 null
     */
    persist(entry: KnowledgeEntry): string | null;
    /** 删除 KnowledgeEntry 对应的 .md 文件 */
    remove(entry: KnowledgeEntry): boolean;
    /**
     * 当 lifecycle 切换时，移动 .md 文件到正确目录
     * candidates/ ↔ recipes/
     *
     * @returns 新的文件路径
     */
    moveOnLifecycleChange(entry: KnowledgeEntry): string | null;
    /**
     * 计算文件存储路径
     * @returns }
     */
    _resolveFilePath(entry: KnowledgeEntry): {
        dir: string;
        filename: string;
    };
    /** 清理旧文件（category 变更或 lifecycle 切换场景） */
    _cleanupOldFile(entry: KnowledgeEntry, newPath: string): void;
    _removeByIdScan(id: string): boolean;
}
/**
 * 计算 .md 内容的 SHA-256 hash（去除 _content_hash 行后）
 * @returns 16 字符 hex
 */
export declare function computeKnowledgeHash(content: string): string;
/**
 * 从 .md 内容解析为 wire format JSON
 * 返回值可直接 KnowledgeEntry.fromJSON(data) 构造实体
 *
 * @param content .md 文件全文
 * @param [relPath] 相对路径（用于溯源）
 * @returns wire format JSON
 */
export declare function parseKnowledgeMarkdown(content: string, relPath?: string): Record<string, unknown>;
export default KnowledgeFileWriter;
