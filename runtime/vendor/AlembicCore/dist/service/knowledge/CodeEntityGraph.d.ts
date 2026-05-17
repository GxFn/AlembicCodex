/**
 * CodeEntityGraph — 代码实体关系图谱
 *
 * Phase E: 在 Semantic Memory 之上构建代码实体图谱
 *
 * 节点类型:
 *   - class      : ObjC @interface / Swift class/struct
 *   - protocol   : ObjC @protocol / Swift protocol
 *   - category   : ObjC Category / Swift Extension
 *   - module     : SPM/CocoaPods module
 *   - pattern    : 设计模式 (singleton, delegate, etc.)
 *
 * 边类型 (复用 knowledge_edges 表):
 *   - inherits    : 类继承
 *   - conforms    : 协议遵循
 *   - extends     : Category/Extension
 *   - depends_on  : 模块依赖
 *   - uses_pattern: 使用设计模式
 *   - is_part_of  : 属于模块
 *   - calls       : 方法调用 (Phase 5)
 *   - data_flow   : 数据流向 (Phase 5)
 *
 * @module CodeEntityGraph
 */
import Logger from '../../infrastructure/logging/Logger.js';
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
type EntityRepoLike = Pick<CodeEntityRepositoryImpl, 'upsert' | 'batchUpsert' | 'findByEntityId' | 'findByEntityIdOnly' | 'listByType' | 'searchByName' | 'clearProject' | 'deleteByFile' | 'deleteByFileAndType' | 'countByType'>;
type EdgeRepoLike = Pick<KnowledgeEdgeRepositoryImpl, 'upsertEdge' | 'removeEdge' | 'findOutgoing' | 'findIncoming' | 'findIncomingByRelation' | 'findOutgoingByRelation' | 'findOutgoingToId' | 'findIncomingByFromTypes' | 'findConformances' | 'findByRelation' | 'countByRelation' | 'getHotNodes' | 'countIncomingByRelation' | 'countByRelationType' | 'deleteByMetadataLike'>;
interface AstClass {
    name: string;
    isCategory?: boolean;
    file?: string;
    line?: number;
    endLine?: number;
    superclass?: string;
    protocols?: string[];
}
interface AstProtocol {
    name: string;
    file?: string;
    line?: number;
    inherits?: string[];
    methods?: unknown[];
}
interface AstCategory {
    className: string;
    categoryName: string;
    file?: string;
    line?: number;
    protocols?: string[];
    methods?: unknown[];
}
interface AstEdge {
    from: string;
    to: string;
    type: string;
}
interface PatternInstance {
    className?: string;
    name?: string;
    file?: string;
}
interface PatternStat {
    count: number;
    files?: string[];
    instances?: PatternInstance[];
}
interface ProjectAstSummary {
    classes?: AstClass[];
    protocols?: AstProtocol[];
    categories?: AstCategory[];
    inheritanceGraph?: AstEdge[];
    patternStats?: Record<string, PatternStat>;
}
interface DepGraphNode {
    id?: string;
    label?: string;
    type?: string;
    layer?: string;
    version?: string;
    group?: string;
    fullPath?: string;
    indirect?: boolean;
    [key: string]: unknown;
}
interface DepGraphData {
    nodes?: (DepGraphNode | string)[];
}
interface CandidateWithRelations {
    title?: string;
    id?: string;
    relations?: Record<string, unknown>;
}
interface CallEdge {
    caller: string;
    callee: string;
    callType: string;
    resolveMethod: string;
    line: number;
    file: string;
    isAwait: boolean;
    argCount?: number;
}
interface DataFlowEdge {
    from?: string;
    to?: string;
    flowType?: string;
    direction?: string;
    [key: string]: unknown;
}
interface GraphPopulateResult {
    entitiesUpserted: number;
    edgesCreated: number;
    durationMs: number;
}
interface MappedCodeEntity {
    entityId: string;
    entityType: string;
    name: string;
    filePath: string | null;
    line: number | null;
    superclass: string | null;
    protocols: string[];
    metadata: Record<string, unknown>;
    projectRoot: string;
    createdAt: number;
    updatedAt: number;
}
interface MappedEdge {
    fromId: string;
    fromType: string;
    toId: string;
    toType: string;
    relation: string;
    weight: number;
    metadata: Record<string, unknown>;
}
interface SearchOptions {
    type?: string;
    limit?: number;
}
interface ContextAgentOptions {
    maxEntities?: number;
    maxEdges?: number;
}
export declare class CodeEntityGraph {
    #private;
    projectRoot: string;
    log: ReturnType<typeof Logger.getInstance>;
    constructor(entityRepo: EntityRepoLike, edgeRepo: EdgeRepoLike, options?: {
        projectRoot?: string;
        logger?: ReturnType<typeof Logger.getInstance>;
    });
    /**
     * 从 AST ProjectAstSummary 填充图谱 (Phase 1.5 → Phase 1.6)
     *
     * 写入: class/protocol/category 实体 + inherits/conforms/extends 边
     *
     * @param astSummary analyzeProject() 产出的 ProjectAstSummary
     */
    populateFromAst(astSummary: ProjectAstSummary | null): Promise<GraphPopulateResult>;
    /**
     * 从 SPM 依赖图填充模块实体 (Phase 2)
     *
     * 当前 bootstrap.js 已将 SPM 边写入 knowledge_edges，
     * 此方法补充 module 实体节点。
     *
     * @param depGraphData spm.getDependencyGraph() 产出
     */
    populateFromSpm(depGraphData: DepGraphData | null): Promise<GraphPopulateResult>;
    /**
     * 从候选的 Relations 字段提取边写入图谱 (Phase 5/6)
     *
     * @param candidates 扁平关系数组或 Relations 对象
     */
    populateFromCandidateRelations(candidates: CandidateWithRelations[] | null): Promise<GraphPopulateResult>;
    /** 获取单个实体信息 */
    getEntity(entityId: string, entityType?: string): Promise<MappedCodeEntity | null>;
    /**
     * 按类型列出所有实体
     * @param entityType 'class'|'protocol'|'category'|'module'|'pattern'
     */
    listEntities(entityType: string, limit?: number): Promise<MappedCodeEntity[]>;
    /**
     * 搜索实体 (名称模糊匹配)
     * @param [options.type] 过滤类型
     */
    searchEntities(query: string, options?: SearchOptions): Promise<MappedCodeEntity[]>;
    /**
     * 获取实体的所有关系边
     */
    getEntityEdges(entityId: string, entityType: string, direction?: string): Promise<{
        outgoing: MappedEdge[];
        incoming: MappedEdge[];
    }>;
    /**
     * 获取继承链 (向上遍历 inherits 边)
     * @returns 继承链 [class, parent, grandparent, ...]
     */
    getInheritanceChain(className: string, maxDepth?: number): Promise<string[]>;
    /**
     * 获取所有子类/实现者 (向下遍历)
     * @param entityType 'class'|'protocol'
     */
    getDescendants(entityId: string, entityType: string, maxDepth?: number): Promise<{
        id: string;
        type: string;
        depth: number;
        relation: string;
    }[]>;
    /** 获取协议遵循关系 (className → 遵循的协议列表) */
    getConformances(className: string): Promise<string[]>;
    /**
     * 查找两个实体间的路径 (BFS)
     */
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
    /**
     * 影响分析: 修改某实体后，哪些实体可能受影响
     */
    getImpactRadius(entityId: string, entityType: string, maxDepth?: number): Promise<{
        id: string;
        type: string;
        relation: string;
        depth: number;
    }[]>;
    /** 项目拓扑概览 — 统计信息 + 关键度排名 */
    getTopology(): Promise<{
        entities: Record<string, number>;
        edges: Record<string, number>;
        totalEntities: number;
        totalEdges: number;
        hotNodes: {
            id: string;
            type: string;
            inDegree: number;
        }[];
    }>;
    /** 生成 Agent 可用的图谱上下文 (Markdown) */
    generateContextForAgent(options?: ContextAgentOptions): Promise<string>;
    /**
     * 从解析后的调用边填充图谱 (Phase 5)
     *
     * @param callEdges
     * @param dataFlowEdges
     */
    populateCallGraph(callEdges: CallEdge[], dataFlowEdges: DataFlowEdge[]): Promise<GraphPopulateResult>;
    /**
     * 获取调用者 — 谁调用了这个方法？
     *
     * @param methodId "ClassName.methodName" 或 FQN
     * @returns >}
     */
    getCallers(methodId: string, maxDepth?: number): Promise<{
        caller: string;
        depth: number;
        callType: string;
    }[]>;
    /**
     * 获取被调用者 — 这个方法调用了谁？
     *
     * @param methodId "ClassName.methodName" 或 FQN
     * @returns >}
     */
    getCallees(methodId: string, maxDepth?: number): Promise<{
        callee: string;
        depth: number;
        callType: string;
    }[]>;
    /**
     * 获取方法的 Impact Radius (基于调用图)
     * — 修改此方法可能影响哪些上游方法？
     *
     * @param methodId "ClassName.methodName"
     * @returns }
     */
    getCallImpactRadius(methodId: string): Promise<{
        directCallers: number;
        transitiveCallers: number;
        affectedFiles: string[];
    }>;
    /**
     * 从 FQN 中提取短 Entity ID
     *
     * "src/service/UserService.ts::UserService.getUser" → "UserService.getUser"
     * "src/utils/helpers.ts::formatDate" → "formatDate"
     */
    _extractEntityId(fqn: string): string;
    /** 清除项目的所有代码实体 (重新 populate 前调用) */
    clearProject(): Promise<void>;
    /**
     * 增量清除 — 仅删除指定文件的 call graph 边和 method 实体
     *
     * @param filePaths 变更文件的相对路径列表
     * @returns }
     */
    clearCallGraphForFiles(filePaths: string[] | null): Promise<{
        deletedEdges: number;
        deletedEntities: number;
    }>;
}
export default CodeEntityGraph;
