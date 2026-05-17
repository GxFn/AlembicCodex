/**
 * KnowledgeGraphService - 知识图谱服务
 *
 * 管理 Recipe 之间的关系（统一模型，包含所有知识类型）
 * 支持关系查询、路径分析、PageRank 权重计算
 */
import { RelationType } from '../../domain/index.js';
import Logger from '../../infrastructure/logging/Logger.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
type EdgeRepoLike = Pick<KnowledgeEdgeRepositoryImpl, 'upsertEdge' | 'removeEdge' | 'findOutgoing' | 'findIncoming' | 'findIncomingByRelations' | 'findByRelation' | 'findAll' | 'getStats'>;
export { RelationType };
export declare class KnowledgeGraphService {
    #private;
    logger: ReturnType<typeof Logger.getInstance>;
    constructor(edgeRepo: EdgeRepoLike);
    /** 添加关系边 */
    addEdge(fromId: string, fromType: string, toId: string, toType: string, relation: string, metadata?: Record<string, unknown>): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    /** 删除关系边 */
    removeEdge(fromId: string, fromType: string, toId: string, toType: string, relation: string): Promise<void>;
    /** 查询某个节点的所有关系 */
    getEdges(nodeId: string, nodeType: string, direction?: string): Promise<{
        outgoing: import("../../repository/knowledge/KnowledgeEdgeRepository.js").KnowledgeEdge[];
        incoming: import("../../repository/knowledge/KnowledgeEdgeRepository.js").KnowledgeEdge[];
    }>;
    /** 查询指定关系类型的连接 */
    getRelated(nodeId: string, nodeType: string, relation: string): Promise<import("../../repository/knowledge/KnowledgeEdgeRepository.js").KnowledgeEdge[]>;
    /** 查找两个节点之间的路径 (BFS, 最大深度 5) */
    findPath(fromId: string, fromType: string, toId: string, toType: string, maxDepth?: number): Promise<{
        found: boolean;
        path: {
            from: {
                id: string;
                type: string;
            };
            to: {
                id: string;
                type: string;
            };
            relation: string;
        }[];
        depth: number;
    }>;
    /** 获取节点的影响范围（下游依赖分析） */
    getImpactAnalysis(nodeId: string, nodeType: string, maxDepth?: number): Promise<any[]>;
    /** 获取图谱整体统计 */
    getStats(nodeType?: string): Promise<import("../../repository/knowledge/KnowledgeEdgeRepository.js").EdgeStats>;
    /**
     * 获取全量边（供 Dashboard 图谱可视化）
     * @param [limit=500] 最大返回条数
     * @param [nodeType] 过滤节点类型（如 'recipe'），为空则返回全部
     */
    getAllEdges(limit?: number, nodeType?: string): Promise<import("../../repository/knowledge/KnowledgeEdgeRepository.js").KnowledgeEdge[]>;
}
export declare function initKnowledgeGraphService(edgeRepo: EdgeRepoLike): KnowledgeGraphService;
export declare function getKnowledgeGraphService(): KnowledgeGraphService | null;
export default KnowledgeGraphService;
