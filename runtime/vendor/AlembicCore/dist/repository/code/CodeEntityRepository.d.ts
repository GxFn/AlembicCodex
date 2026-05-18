/**
 * CodeEntityRepository — AST 代码实体的仓储实现
 *
 * 从 CodeEntityGraph 和 PanoramaScanner 提取的数据操作，
 * 使用 Drizzle 类型安全 API。
 */
import { codeEntities } from '../../infrastructure/database/drizzle/schema.js';
import { RepositoryBase } from '../../repository/base/RepositoryBase.js';
export interface CodeEntity {
    id: number;
    entityId: string;
    entityType: string;
    projectRoot: string;
    name: string;
    filePath: string | null;
    lineNumber: number | null;
    superclass: string | null;
    protocols: string[];
    metadata: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}
export interface CodeEntityInsert {
    entityId: string;
    entityType: string;
    projectRoot: string;
    name: string;
    filePath?: string | null;
    lineNumber?: number | null;
    superclass?: string | null;
    protocols?: string[];
    metadata?: Record<string, unknown>;
}
export declare class CodeEntityRepositoryImpl extends RepositoryBase<typeof codeEntities, CodeEntity> {
    #private;
    constructor(drizzle: ConstructorParameters<typeof RepositoryBase<typeof codeEntities, CodeEntity>>[0]);
    findById(id: number): Promise<CodeEntity | null>;
    create(data: CodeEntityInsert): Promise<CodeEntity>;
    delete(id: number): Promise<boolean>;
    /** UPSERT — 按 (entityId, entityType, projectRoot) 唯一约束 */
    upsert(entity: CodeEntityInsert): Promise<CodeEntity>;
    /** 批量 UPSERT */
    batchUpsert(entities: CodeEntityInsert[]): Promise<number>;
    /** 按文件路径查询 */
    findByFile(filePath: string, projectRoot: string): Promise<CodeEntity[]>;
    /** 按实体类型列表 */
    listByType(entityType: string, projectRoot: string, limit?: number): Promise<CodeEntity[]>;
    /** 按名称搜索 */
    searchByName(query: string, projectRoot: string, options?: {
        entityType?: string;
        limit?: number;
    }): Promise<CodeEntity[]>;
    /** 按 entityId + entityType + projectRoot 精确查找 */
    findByEntityId(entityId: string, entityType: string, projectRoot: string): Promise<CodeEntity | null>;
    /** 删除指定项目的所有实体 */
    clearProject(projectRoot: string): Promise<number>;
    /** 删除指定文件的实体（用于增量更新调用图） */
    deleteByFile(filePath: string, projectRoot: string): Promise<number>;
    /** 获取实体总数 */
    getEntityCount(projectRoot?: string): Promise<number>;
    /** 按类型统计实体数 */
    countByType(projectRoot: string): Promise<Record<string, number>>;
    /** 按文件路径和实体类型删除 */
    deleteByFileAndType(filePath: string, entityType: string, projectRoot: string): Promise<number>;
    /** 按 entityId + projectRoot 查找（不限 entityType） */
    findByEntityIdOnly(entityId: string, projectRoot: string): Promise<CodeEntity | null>;
    /** 查询非 module 实体的 (entityId, filePath) 去重列表 */
    findDistinctEntityIdsWithFilePath(projectRoot: string): Promise<Array<{
        entityId: string;
        filePath: string;
    }>>;
    /** 查询本地模块 (排除 external/host nodeType) */
    findLocalModules(projectRoot: string): Promise<Array<{
        entityId: string;
        name: string;
    }>>;
    /** 查询指定 nodeType 的模块实体 */
    findModulesByNodeTypes(projectRoot: string, nodeTypes: string[]): Promise<CodeEntity[]>;
    /** 统计指定 nodeType 的模块数量 */
    countModulesByNodeType(projectRoot: string, nodeType: string): Promise<number>;
    /** 按 projectRoot + filePaths 批量查询实体 */
    findByProjectAndFilePaths(projectRoot: string, filePaths: string[]): Promise<CodeEntity[]>;
    /** 查询非 module 实体的去重文件路径列表 */
    findDistinctFilePaths(projectRoot: string, limit?: number): Promise<string[]>;
    /** 批量 INSERT OR IGNORE (不更新已存在的行) */
    batchInsertIgnore(entities: CodeEntityInsert[]): Promise<number>;
    /**
     * 符号名是否存在。
     */
    existsByName(name: string): boolean;
}
