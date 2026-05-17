import type KnowledgeEntry from './KnowledgeEntry.js';
export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}
export interface PaginatedResult {
    data: KnowledgeEntry[];
    pagination: Record<string, unknown>;
}
/**
 * KnowledgeRepository — 统一知识实体仓储接口
 *
 * 替代 CandidateRepository + RecipeRepository。
 * 实现类见 lib/repository/knowledge/KnowledgeRepository.impl.js
 */
export declare class KnowledgeRepository {
    create(entry: KnowledgeEntry): Promise<KnowledgeEntry>;
    findById(id: string): Promise<KnowledgeEntry | null>;
    findByTitle(title: string): Promise<KnowledgeEntry | null>;
    findWithPagination(filters?: Record<string, unknown>, options?: PaginationOptions & {
        orderBy?: string;
        order?: string;
    }): Promise<PaginatedResult>;
    findByLifecycle(lifecycle: string, pagination?: PaginationOptions): Promise<PaginatedResult>;
    findByKind(kind: string, options?: PaginationOptions & {
        lifecycle?: string;
    }): Promise<PaginatedResult>;
    findActiveRules(): Promise<KnowledgeEntry[]>;
    findByLanguage(language: string, pagination?: PaginationOptions): Promise<PaginatedResult>;
    findByCategory(category: string, pagination?: PaginationOptions): Promise<PaginatedResult>;
    search(keyword: string, pagination?: PaginationOptions): Promise<PaginatedResult>;
    update(id: string, updates: Record<string, unknown>): Promise<KnowledgeEntry>;
    delete(id: string): Promise<boolean>;
    findByRelationLike(nodeId: string, excludeId: string): Promise<Array<{
        id: string;
        title: string;
        relations: string;
    }>>;
    getStats(): Promise<Record<string, unknown>>;
}
export default KnowledgeRepository;
