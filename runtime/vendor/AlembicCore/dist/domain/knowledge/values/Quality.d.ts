/**
 * Quality — 质量值对象
 *
 * 4 维度评分 + 综合分 + 等级。
 */
interface QualityProps {
    completeness?: number;
    adaptation?: number;
    documentation?: number;
    overall?: number;
    grade?: string;
}
export declare class Quality {
    adaptation: number;
    completeness: number;
    documentation: number;
    grade: string;
    overall: number;
    constructor(props?: QualityProps);
    /** 从任意输入构造 Quality */
    static from(input: unknown): Quality;
    /** 从 3 维度计算综合分 */
    recalculate(): this;
    /**
     * 根据分数计算等级
     * @param score 0-1
     */
    static calcGrade(score: number): string;
    /** 转换为 wire format JSON */
    toJSON(): {
        completeness: number;
        adaptation: number;
        documentation: number;
        overall: number;
        grade: string;
    };
    /** 从 wire format 创建 */
    static fromJSON(data: unknown): Quality;
}
export default Quality;
