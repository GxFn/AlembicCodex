/**
 * BaseDimensions — DimensionRegistry 的适配层
 *
 * 从统一维度注册表 (DimensionRegistry) 派生的瘦适配层：
 *   - `baseDimensions` 从 DIMENSION_REGISTRY 转换为下游兼容格式
 *   - `resolveActiveDimensions()` 委托给 DimensionRegistry
 *   - `BaseDimension` 接口保留给 MissionBriefingBuilder 等消费者使用
 */
/** Single dimension definition with optional language/framework conditions */
export interface BaseDimension {
    id: string;
    label: string;
    guide: string;
    knowledgeTypes: string[];
    skillWorthy?: boolean;
    dualOutput?: boolean;
    skillMeta?: {
        name: string;
        description: string;
    };
    conditions?: {
        languages?: string[];
        frameworks?: string[];
    };
    tierHint?: number;
}
/**
 * 从统一注册表派生的维度列表
 * 保持数组结构与旧 baseDimensions 兼容
 */
export declare const baseDimensions: BaseDimension[];
/**
 * 根据项目主语言和检测到的框架过滤条件维度
 * @param allDimensions 所有维度定义（含 conditions 字段）
 * @param primaryLang 主语言
 * @param detectedFrameworks 检测到的框架
 * @returns 适用的维度列表
 */
export declare function resolveActiveDimensions(allDimensions: BaseDimension[], primaryLang: string, detectedFrameworks?: string[]): BaseDimension[];
