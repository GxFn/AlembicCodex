/**
 * @module DataFlowInferrer
 * @description Phase 5: 从调用边推断数据流边 (L0 + L1 粒度)
 *
 * 数据流粒度:
 *   - L0: 模块级 — A 文件 import B 文件 → 数据可能从 B 流向 A
 *   - L1: 函数级 — A.foo() 调用 B.bar(x) → x 从 A 流向 B
 *
 * Phase 5.0 只实现 L0 + L1，L2/L3 (参数级/语句级) 留待 Phase 5.2。
 */
import type { ResolvedEdge } from './CallEdgeResolver.js';
export interface DataFlowEdge {
    from: string;
    to: string;
    flowType: 'argument' | 'return-value';
    direction: 'forward' | 'backward';
    confidence?: number;
    [key: string]: unknown;
}
export declare class DataFlowInferrer {
    /** 从已解析的调用边推断数据流边 */
    static infer(resolvedEdges: ResolvedEdge[]): DataFlowEdge[];
}
export default DataFlowInferrer;
