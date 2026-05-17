/**
 * KnowledgeEdgeRepository — 知识图谱边的仓储实现
 *
 * 从 KnowledgeGraphService 提取的数据操作，使用 Drizzle 类型安全 API。
 * KnowledgeGraphService 将从直接 db.prepare() 迁移为调用此 Repository。
 */
import { knowledgeEdges } from '../../infrastructure/database/drizzle/schema.js';
import { type DrizzleTx, RepositoryBase } from '../base/RepositoryBase.js';
export interface KnowledgeEdge {
    id: number;
    fromId: string;
    fromType: string;
    toId: string;
    toType: string;
    relation: string;
    weight: number;
    metadata: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}
export interface EdgeInsert {
    fromId: string;
    fromType?: string;
    toId: string;
    toType?: string;
    relation: string;
    weight?: number;
    metadata?: Record<string, unknown>;
}
export interface EdgeStats {
    totalEdges: number;
    byRelation: Record<string, number>;
    nodeTypes: string[];
}
export declare class KnowledgeEdgeRepositoryImpl extends RepositoryBase<typeof knowledgeEdges, KnowledgeEdge> {
    #private;
    constructor(drizzle: ConstructorParameters<typeof RepositoryBase<typeof knowledgeEdges, KnowledgeEdge>>[0]);
    findById(id: number): Promise<KnowledgeEdge | null>;
    create(data: EdgeInsert): Promise<KnowledgeEdge>;
    delete(id: number): Promise<boolean>;
    /** INSERT OR REPLACE — 按 (fromId, fromType, toId, toType, relation) 唯一约束 upsert */
    upsertEdge(edge: EdgeInsert): Promise<KnowledgeEdge>;
    /** 删除指定的边 */
    removeEdge(fromId: string, fromType: string, toId: string, toType: string, relation: string): Promise<void>;
    /** 查询指定节点的出边 */
    findOutgoing(nodeId: string, nodeType: string): Promise<KnowledgeEdge[]>;
    /** 查询指定节点的入边 */
    findIncoming(nodeId: string, nodeType: string): Promise<KnowledgeEdge[]>;
    /** 查询指定节点的入边（仅限指定关系类型） */
    findIncomingByRelations(nodeId: string, nodeType: string, relations: string[]): Promise<KnowledgeEdge[]>;
    /** 查询指定节点按特定关系的入边 */
    findIncomingByRelation(nodeId: string, relation: string): Promise<KnowledgeEdge[]>;
    /** 查询指定节点按特定关系的出边 */
    findOutgoingByRelation(nodeId: string, relation: string): Promise<KnowledgeEdge[]>;
    /** 查询指定节点按关系+类型条件的出边（仅 to_id 字段） */
    findOutgoingToId(fromId: string, fromType: string, relation: string): Promise<string | null>;
    /** 查询指定节点按多类型条件的入边 */
    findIncomingByFromTypes(toId: string, toType: string, relation: string): Promise<KnowledgeEdge[]>;
    /** 查询 from_id 在指定类型列表中的遵循边 — 用于 getConformances */
    findConformances(fromId: string): Promise<string[]>;
    /** 按关系分组统计 */
    countByRelation(): Promise<Record<string, number>>;
    /** 获取入度最高的节点（被引用最多），排除多语言基类和框架根类 */
    getHotNodes(limit?: number): Promise<{
        id: string;
        type: string;
        inDegree: number;
    }[]>;
    /** 按关系类型统计某节点的入边数 */
    countIncomingByRelation(toId: string, relation: string): Promise<number>;
    /** 按关系类型查询总数 */
    countByRelationType(relation: string): Promise<number>;
    /** 按 metadata_json LIKE 模式删除边（可选过滤关系类型） */
    deleteByMetadataLike(pattern: string, relations?: string[]): Promise<number>;
    /** 删除指定节点的所有出边（按 fromId + fromType） */
    deleteOutgoing(fromId: string, fromType: string): Promise<number>;
    /** 根据 entry ID 删除所有相关边（用于知识删除时清理图谱） */
    deleteByEntryId(entryId: string): Promise<number>;
    /** 按关系类型查询 */
    findByRelation(nodeId: string, nodeType: string, relation: string): Promise<KnowledgeEdge[]>;
    /** 获取所有边（可选类型过滤 + 限制数量） */
    findAll(options?: {
        nodeType?: string;
        limit?: number;
    }): Promise<KnowledgeEdge[]>;
    /** 统计信息 */
    getStats(nodeType?: string): Promise<EdgeStats>;
    /** 在事务中执行批量边操作 */
    batchInTransaction(fn: (tx: DrizzleTx) => void): Promise<void>;
    /**
     * 统计 knowledge_edges JOIN code_entities 的边数 (fan-in/fan-out 分析)
     * direction='from': JOIN on from_id 侧 (fan-out: 模块内实体发出的边)
     * direction='to':   JOIN on to_id 侧 (fan-in: 模块内实体接收的边)
     */
    countEdgesJoinedByEntityFiles(projectRoot: string, filePaths: string[], relation: string, direction: 'from' | 'to'): Promise<number>;
    /**
     * 查询实体使用的设计模式名称 (uses_pattern 边)
     * 限定实体在指定项目的指定文件路径内
     */
    findPatternsUsedByEntities(projectRoot: string, filePaths: string[]): Promise<string[]>;
    /** 最频繁被调用的节点 (calls 关系 GROUP BY to_id) */
    findTopCalledNodes(limit: number): Promise<Array<{
        toId: string;
        callCount: number;
    }>>;
    /** 入口点: 只有 calls 出度没有 calls 入度的节点 */
    findEntryPoints(limit: number): Promise<string[]>;
    /** 数据生产者: data_flow 出度 > threshold 的节点 */
    findTopDataFlowSources(limit: number, threshold: number): Promise<string[]>;
    /** 数据消费者: data_flow 入度 > threshold 的节点 */
    findTopDataFlowSinks(limit: number, threshold: number): Promise<string[]>;
    /**
     * 查询指定关系的边，过滤条件：from 侧是 module 或在指定项目的 code_entities 中存在
     * (用于 CouplingAnalyzer 构建模块间依赖边)
     */
    findEdgesFilteredByEntityExistence(relation: string, projectRoot: string): Promise<Array<{
        fromId: string;
        fromType: string;
        toId: string;
        toType: string;
    }>>;
    /** 查询 module→module 的 depends_on 边 (fromId, toId) */
    findModuleDependencyPairs(): Promise<Array<{
        fromId: string;
        toId: string;
    }>>;
    /** 批量 INSERT OR IGNORE 边 (不更新已存在的行) */
    bulkInsertIgnore(edges: EdgeInsert[]): Promise<number>;
}
