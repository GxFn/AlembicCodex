/**
 * BinaryPersistence — 自定义二进制格式 (.asvec) 的序列化/反序列化
 *
 * 文件格式:
 * ┌─────────────────────────────────────┐
 * │ Header (32 bytes)                   │
 * │  Magic: "ASVEC" (5b)               │
 * │  Version: uint8 (1b)               │
 * │  Flags: uint16 (2b)                │
 * │  Dimension: uint16 (2b)            │
 * │  NumVectors: uint32 (4b)           │
 * │  HnswM: uint16 (2b)               │
 * │  HnswMaxLevel: uint16 (2b)        │
 * │  EntryPoint: uint32 (4b)           │
 * │  Reserved: (10b)                    │
 * ├─────────────────────────────────────┤
 * │ Quantizer (if flags.bit0)           │
 * │  Mins: Float32[dim]                │
 * │  Maxs: Float32[dim]               │
 * ├─────────────────────────────────────┤
 * │ Vectors section                     │
 * │  Per vector: idLen(u16) + id(utf8) │
 * │    + level(u8) + vector(f32*dim)   │
 * ├─────────────────────────────────────┤
 * │ Graph section                       │
 * │  Per level: numEntries(u32)         │
 * │    Per entry: nodeIdx(u32)          │
 * │      + numNeighbors(u16)            │
 * │      + neighbors(u32[])             │
 * ├─────────────────────────────────────┤
 * │ Metadata section (JSON)             │
 * │  metadataLen(u32) + JSON(utf8)      │
 * └─────────────────────────────────────┘
 *
 * @module infrastructure/vector/BinaryPersistence
 */
import type { WriteZone } from '../io/WriteZone.js';
import type { ScalarQuantizer } from './ScalarQuantizer.js';
declare const MAGIC = "ASVEC";
declare const VERSION = 1;
declare const HEADER_SIZE = 32;
declare const FLAG_HAS_QUANTIZER = 1;
declare const FLAG_HAS_HNSW_GRAPH = 2;
declare const FLAG_SQ8_VECTORS = 4;
interface HnswSerializedData {
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
}
export declare class BinaryPersistence {
    /**
     * 保存 HNSW 索引到二进制文件 (同步)
     *
     * @param filePath 文件路径 (.asvec)
     * @param data.index HNSW 索引
     * @param data.quantizer 量化器
     * @param data.metadata 文档 metadata
     * @param data.contents 文档 content
     */
    static save(filePath: string, data: {
        index: {
            serialize: () => HnswSerializedData;
        };
        quantizer: ScalarQuantizer | null;
        metadata: Map<string, unknown>;
        contents: Map<string, string>;
    }, wz?: WriteZone): void;
    /** 异步保存 */
    static saveAsync(filePath: string, data: {
        index: {
            serialize: () => HnswSerializedData;
        };
        quantizer: ScalarQuantizer | null;
        metadata: Map<string, unknown>;
        contents: Map<string, string>;
    }, wz?: WriteZone): Promise<void>;
    /**
     * 加载二进制索引 (同步)
     * @returns }
     */
    static load(filePath: string): {
        indexData: {
            M: number;
            M0: number;
            efConstruct: number;
            efSearch: number;
            entryPoint: number;
            maxLevel: number;
            nodes: {
                id: string;
                vector: number[];
                level: number;
            }[];
            graphs: [number, number[]][][];
        };
        quantizerData: {
            dimension: number;
            mins: number[];
            maxs: number[];
        } | null;
        metadata: Map<any, any>;
        contents: Map<any, any>;
        dimension: number;
    };
    /** 编码为 Buffer */
    static encode(data: {
        index: {
            serialize: () => HnswSerializedData;
        };
        quantizer: ScalarQuantizer | null;
        metadata: Map<string, unknown>;
        contents: Map<string, string>;
    }): Buffer<ArrayBuffer>;
    /**
     * 从 Buffer 解码
     * @returns }
     */
    static decode(buf: Buffer): {
        indexData: {
            M: number;
            M0: number;
            efConstruct: number;
            efSearch: number;
            entryPoint: number;
            maxLevel: number;
            nodes: {
                id: string;
                vector: number[];
                level: number;
            }[];
            graphs: [number, number[]][][];
        };
        quantizerData: {
            dimension: number;
            mins: number[];
            maxs: number[];
        } | null;
        metadata: Map<any, any>;
        contents: Map<any, any>;
        dimension: number;
    };
    /** 检查文件是否为有效的 ASVEC 文件 */
    static isValid(filePath: string): boolean;
}
export { MAGIC, VERSION, HEADER_SIZE, FLAG_HAS_QUANTIZER, FLAG_HAS_HNSW_GRAPH, FLAG_SQ8_VECTORS };
