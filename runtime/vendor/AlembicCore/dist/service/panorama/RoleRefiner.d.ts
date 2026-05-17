/**
 * RoleRefiner — 四重信号融合角色精化
 *
 * 将 TargetClassifier 的正则推断 (~65% 准确率) 提升到 ≥90%，
 * 通过融合 AST 结构、CallGraph 行为、DataFlow 数据流、EntityGraph 拓扑四重信号。
 *
 * 信号权重:
 *   AST 结构        0.30   继承链/协议/import/后缀
 *   CallGraph 行为   0.30   被调用分析/扇入扇出比/调用类型
 *   DataFlow 数据流  0.15   源汇分析/转换检测
 *   EntityGraph 拓扑 0.10   入度分析/模式检测
 *   正则基线         0.15   TargetClassifier 结果
 *
 * @module RoleRefiner
 */
import type { BootstrapRepositoryImpl } from '../../repository/bootstrap/BootstrapRepository.js';
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type { ModuleRole } from './PanoramaTypes.js';
export type { ModuleRole } from './PanoramaTypes.js';
export interface RoleSignal {
    role: ModuleRole;
    confidence: number;
    weight: number;
    source: string;
}
export type RoleResolution = 'clear' | 'uncertain' | 'fallback';
export interface RefinedRole {
    refinedRole: ModuleRole;
    confidence: number;
    resolution: RoleResolution;
    alternatives?: Array<[string, number]>;
    signals: RoleSignal[];
}
export interface ModuleCandidate {
    name: string;
    inferredRole: ModuleRole;
    files: string[];
    /** 来自配置文件的层级名称（如 Boxfile 中的 layer 声明） */
    configLayer?: string;
}
export declare class RoleRefiner {
    #private;
    constructor(bootstrapRepo: BootstrapRepositoryImpl, entityRepo: CodeEntityRepositoryImpl, edgeRepo: KnowledgeEdgeRepositoryImpl, projectRoot: string);
    /**
     * 精化单个模块的角色
     */
    refineRole(module: ModuleCandidate): Promise<RefinedRole>;
    /**
     * 批量精化所有模块
     */
    refineAll(modules: ModuleCandidate[]): Promise<Map<string, RefinedRole>>;
}
