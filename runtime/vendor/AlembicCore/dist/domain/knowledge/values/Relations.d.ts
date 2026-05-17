/**
 * Relations — 关系图值对象
 *
 * 统一为分桶结构（非扁平数组）。
 * 每个桶存储 [{ target, description }] 格式的关系列表。
 */
/** 所有合法的关系桶名 (snake_case) */
export declare const RELATION_BUCKETS: string[];
export interface RelationEntry {
    target: string;
    description: string;
}
type RelationBuckets = Record<string, Array<string | Partial<RelationEntry>>>;
export declare class Relations {
    _b: Record<string, RelationEntry[]>;
    constructor(buckets?: RelationBuckets);
    /** 从任意输入构造 Relations */
    static from(input: unknown): Relations;
    /**
     * 扁平视图（仅 Dashboard 渲染用）
     * @returns >}
     */
    toFlatArray(): Array<{
        type: string;
        target: string;
        description: string;
    }>;
    /**
     * 获取指定桶
     * @returns >}
     */
    getByType(type: string): RelationEntry[];
    /** 是否为空 */
    isEmpty(): boolean;
    /**
     * 添加关系
     * @param type 桶名
     * @param target 目标
     */
    add(type: string, target: string, description?: string): Relations;
    /**
     * 移除关系
     * @param type 桶名
     * @param target 目标
     */
    remove(type: string, target: string): Relations;
    /** 转换为 wire format JSON (分桶) */
    toJSON(): {
        [x: string]: RelationEntry[];
    };
    /** 从 wire format 创建 */
    static fromJSON(data: unknown): Relations;
}
export default Relations;
