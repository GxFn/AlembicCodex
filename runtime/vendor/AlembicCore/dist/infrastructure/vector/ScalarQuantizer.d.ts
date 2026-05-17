/**
 * ScalarQuantizer — SQ8 标量量化器
 *
 * 将 Float32 向量映射到 Uint8 (0-255)，使用 per-dimension min/max 线性缩放:
 *   q_i = round((v_i - min_i) / (max_i - min_i) * 255)
 *   v̂_i = q_i / 255 * (max_i - min_i) + min_i
 *
 * 优势:
 * - 内存: 768 维 × 4 bytes → 768 维 × 1 byte = 75% 节省
 * - Recall: > 95% (误差极小)
 *
 * @module infrastructure/vector/ScalarQuantizer
 */
export declare class ScalarQuantizer {
    #private;
    /** @param dimension 向量维度 */
    constructor(dimension: number);
    get dimension(): number;
    get trained(): boolean;
    /**
     * 训练量化器 — 从一批向量中统计 per-dimension min/max
     * @param vectors 训练集 (建议 ≥ 100 条)
     */
    train(vectors: Array<Float32Array | number[]>): void;
    /** 量化单个向量 */
    encode(vector: Float32Array | number[]): Uint8Array<ArrayBuffer>;
    /** 批量量化 */
    encodeBatch(vectors: Array<Float32Array | number[]>): Uint8Array<ArrayBuffer>[];
    /** 反量化 (用于精排 re-rank) */
    decode(quantized: Uint8Array): Float32Array<ArrayBuffer>;
    /**
     * 量化空间内的距离计算 (避免反量化, 整数运算)
     * 使用 L2 on quantized space 近似余弦距离
     *
     * @returns 距离值 (越小越相似)
     */
    distance(a: Uint8Array, b: Uint8Array): number;
    /**
     * 混合距离: 量化粗排 + 原始精排
     * 用于搜索时: 先用 SQ8 快速过滤, 再用 Float32 精确计算
     *
     * @returns }
     */
    hybridDistance(quantizedA: Uint8Array, originalA: Float32Array | number[], quantizedB: Uint8Array, originalB: Float32Array | number[]): {
        coarse: number;
        fine: number;
    };
    /**
     * 序列化量化器参数
     * @returns }
     */
    serialize(): {
        dimension: number;
        mins: number[];
        maxs: number[];
    };
    /**
     * 从序列化数据恢复量化器
     * @param data
     */
    static deserialize(data: {
        dimension: number;
        mins: number[];
        maxs: number[];
    }): ScalarQuantizer;
}
