/**
 * LayerInferrer — 拓扑排序层级推断
 *
 * 基于模块依赖图，通过去环 + 拓扑排序 + 最长路径法推断架构层级 (L0-Ln)。
 * 底层 (L0) = Foundation/Core，顶层 = App/UI。
 *
 * 当配置文件声明了明确的层级结构时（如 Boxfile 的 layer 定义），
 * 优先使用配置层级，仅对未覆盖的模块做拓扑推断。
 *
 * @module LayerInferrer
 */
import type { CyclicDependency, Edge, LayerHierarchy } from './PanoramaTypes.js';
export interface ConfigLayer {
    name: string;
    order: number;
    accessibleLayers: string[];
}
export interface InferOptions {
    /** 来自配置文件的层级定义（如 Boxfile、Project.swift 等） */
    configLayers?: ConfigLayer[] | null;
    /** 模块 → 配置层级名映射 */
    moduleLayerMap?: Map<string, string>;
}
export declare class LayerInferrer {
    #private;
    /**
     * 从模块依赖边推断架构层级
     * @param edges - 模块间依赖边 (from depends_on/calls/data_flow to)
     * @param modules - 所有模块名
     * @param cycles - 已检测到的循环依赖
     * @param options - 可选配置：configLayers（配置声明的层级）和 moduleLayerMap（模块→层级映射）
     */
    infer(edges: Edge[], modules: string[], cycles: CyclicDependency[], options?: InferOptions): LayerHierarchy;
}
