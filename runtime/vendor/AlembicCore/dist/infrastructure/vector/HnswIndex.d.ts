/**
 * HnswIndex — 纯 JS 实现的 HNSW 近似最近邻索引
 *
 * 参考论文: "Efficient and robust approximate nearest neighbor search
 *           using Hierarchical Navigable Small World graphs" (Malkov & Yashunin, 2018)
 *
 * 特点:
 * - 零外部依赖, 纯 JavaScript 实现
 * - 支持增量插入 (无需全量重建)
 * - 余弦距离 (1 - cosineSimilarity)
 * - 可配置超参数 (M, efConstruct, efSearch)
 *
 * @module infrastructure/vector/HnswIndex
 */
declare class MinHeap {
    #private;
    get size(): number;
    peek(): {
        nodeIdx: number;
        dist: number;
    };
    push(nodeIdx: number, dist: number): void;
    pop(): {
        nodeIdx: number;
        dist: number;
    } | null;
    toArray(): {
        nodeIdx: number;
        dist: number;
    }[];
}
declare class MaxHeap {
    #private;
    get size(): number;
    peek(): {
        nodeIdx: number;
        dist: number;
    };
    push(nodeIdx: number, dist: number): void;
    pop(): {
        nodeIdx: number;
        dist: number;
    } | null;
    /** 按距离升序返回所有元素 */
    toSortedArray(): {
        nodeIdx: number;
        dist: number;
    }[];
}
export declare class HnswIndex {
    #private;
    M: number;
    M0: number;
    efConstruct: number;
    efSearch: number;
    mL: number;
    /** >} */
    nodes: Array<{
        id: string;
        vector: Float32Array | number[];
        level: number;
        qvector?: Uint8Array | null;
    } | null>;
    /** graphs — per-level adjacency: graphs[level].get(nodeIdx) → Set<neighborIdx> */
    graphs: Map<number, Set<number>>[];
    entryPoint: number;
    maxLevel: number;
    /** id → nodeIdx */
    idToIndex: Map<any, any>;
    /** @param [options.distanceFn] 自定义距离函数 (a, b) => number */
    constructor(options?: {
        M?: number;
        efConstruct?: number;
        efSearch?: number;
        distanceFn?: (a: Float32Array | number[], b: Float32Array | number[]) => number;
    });
    /** 获取节点数量 */
    get size(): number;
    /** 余弦距离 = 1 - cosineSimilarity (越小越相似) */
    distance(a: Float32Array | number[], b: Float32Array | number[]): number;
    /**
     * 插入一个向量到索引
     * @param id 文档 ID
     * @param [options.qvector] 预量化向量 (SQ8), 用于 2-pass 搜索加速
     */
    addPoint(id: string, vector: Float32Array | number[], options?: {
        qvector?: Uint8Array | null;
    }): void;
    /**
     * 移除一个向量 (软删除: 断开所有连接但保留 slot)
     * 完整的 compaction 可在持久化时做
     */
    removePoint(id: string): void;
    /** 为所有现有节点批量设置量化向量 */
    setQuantizedVectors(quantizer: {
        encode: (vector: Float32Array | number[]) => Uint8Array;
    }): void;
    /**
     * 搜索 K 个最近邻
     *
     * 支持 2-pass 搜索 (SQ8 粗排 + Float32 精排):
     * - 传入 quantizedQuery + quantizer 时启用
     * - Phase 1-2: 使用 SQ8 量化距离图遍历 (快速粗排)
     * - Phase 3: 对候选用 Float32 精确余弦距离重排 (精排)
     *
     * @param [options.quantizedQuery] SQ8 编码后的查询向量
     * @returns >}
     */
    searchKnn(queryVector: Float32Array | number[], k?: number, options?: {
        quantizedQuery?: Uint8Array;
        quantizer?: {
            distance: (a: Uint8Array, b: Uint8Array) => number;
        };
    }): {
        id: string | undefined;
        nodeIdx: number;
        dist: number;
    }[];
    /**
     * 导出索引状态 (用于持久化)
     * @returns }
     */
    serialize(): {
        M: number;
        M0: number;
        efConstruct: number;
        efSearch: number;
        entryPoint: number;
        maxLevel: number;
        nodes: ({
            id: string;
            vector: number[];
            level: number;
        } | null)[];
        graphs: [number, number[]][][];
    };
    /**
     * 从序列化数据恢复索引
     * @param data serialize() 的返回值
     */
    static deserialize(data: {
        M: number;
        M0: number;
        efConstruct: number;
        efSearch: number;
        entryPoint: number;
        maxLevel: number;
        nodes: Array<{
            id: string;
            vector: number[];
            level: number;
        } | null>;
        graphs: [number, number[]][][];
    }): HnswIndex;
    /**
     * 批量插入 (比逐个 addPoint 更高效的初始构建)
     * @param items
     */
    addPoints(items: Array<{
        id: string;
        vector: Float32Array | number[];
    }>): void;
    /** 获取索引统计信息 */
    getStats(): {
        totalNodes: number;
        deletedSlots: number;
        maxLevel: number;
        levels: number;
        totalEdges: number;
        entryPoint: number;
    };
}
/** 余弦距离 = 1 - cosineSimilarity */
export declare function cosineDistance(a: Float32Array | number[], b: Float32Array | number[]): number;
export { MinHeap, MaxHeap };
