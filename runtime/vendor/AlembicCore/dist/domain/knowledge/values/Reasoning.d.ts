/** Reasoning — 推理值对象 */
interface ReasoningProps {
    whyStandard?: string;
    sources?: string[];
    confidence?: number;
    qualitySignals?: Record<string, number>;
    alternatives?: string[];
}
export declare class Reasoning {
    alternatives: string[];
    confidence: number;
    qualitySignals: Record<string, number>;
    sources: string[];
    whyStandard: string;
    constructor(props?: ReasoningProps);
    /** 从任意输入构造 Reasoning */
    static from(input: unknown): Reasoning;
    /** 验证推理信息的完整性 */
    isValid(): boolean;
    /** 转换为 JSON */
    toJSON(): {
        whyStandard: string;
        sources: string[];
        confidence: number;
        qualitySignals: Record<string, number>;
        alternatives: string[];
    };
    /** 从 wire format 创建 */
    static fromJSON(data: unknown): Reasoning;
}
export default Reasoning;
