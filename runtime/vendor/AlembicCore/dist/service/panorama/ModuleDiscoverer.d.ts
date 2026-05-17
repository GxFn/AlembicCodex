/**
 * ModuleDiscoverer — 模块发现与文件归属
 *
 * 从 DB（code_entities / knowledge_edges）读取已扫描的模块数据。
 * 前提：PanoramaScanner.ensureData() 保证 DB 中已有结构数据。
 *
 *   策略 1:   code_entities entity_type='module' + is_part_of 边 → 完整数据
 *   策略 1.5: module 实体存在但无 is_part_of 边 → 文件系统 + DB 路径补全
 *
 * 若 DB 中无 module 实体，返回空数组（由 PanoramaScanner 负责兜底扫描）。
 *
 * @module ModuleDiscoverer
 */
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type { ModuleCandidate } from './RoleRefiner.js';
export declare class ModuleDiscoverer {
    #private;
    constructor(entityRepo: CodeEntityRepositoryImpl, edgeRepo: KnowledgeEdgeRepositoryImpl, projectRoot: string);
    /**
     * 从 DB 中读取已扫描的模块数据。
     * 若无 module 实体（含 host），返回空数组（让调用侧决定是否重新扫描）。
     */
    discover(): Promise<ModuleCandidate[]>;
    /**
     * 读取 config layers 元数据（如果存在）
     * @returns 从 `__config_layers__` 实体中恢复的层级定义
     */
    readConfigLayers(): Promise<Array<{
        name: string;
        order: number;
        accessibleLayers: string[];
    }> | null>;
}
