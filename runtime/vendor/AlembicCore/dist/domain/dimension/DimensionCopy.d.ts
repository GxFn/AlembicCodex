/**
 * @module DimensionCopyRegistry
 * @description 维度文案注册表 - 按编程语言提供差异化的 label 和 guide
 *
 * Bootstrap 的 baseDimensions 中每个维度的 label/guide 不再硬编码为 ObjC/Swift 视角，
 * 而是通过此注册表按项目主语言动态选择最匹配的文案。
 *
 * ---
 * 使用方式：
 *   import { DimensionCopy } from '@alembic/core/domain/dimension/DimensionCopy';
 *   const copy = DimensionCopy.get('design-patterns', 'python');
 *   // → { label: '设计模式与代码惯例', guide: '装饰器/描述器/上下文管理器/生成器/ABC 抽象基类/Mixin 模式' }
 */
export declare class DimensionCopy {
    /**
     * 获取指定维度在指定语言下的文案
     * @param dimId 维度 ID (如 'code-standard')
     * @param lang 主语言 ID (如 'python', 'typescript')
     * @returns | null}
     */
    static get(dimId: string, lang: string): {
        label: string;
        guide: string;
    } | null;
    /**
     * 批量为维度数组注入语言差异化文案（单语言版本）
     * 会直接修改维度对象的 label 和 guide 字段
     * @param dimensions
     * @param lang 主语言
     * @returns >} 原数组引用
     */
    static apply(dimensions: Array<{
        id: string;
        label: string;
        guide: string;
    }>, lang: string): {
        id: string;
        label: string;
        guide: string;
    }[];
    /**
     * 多语言版本 — 合并主语言 + 次要语言的 guide 文案
     *
     * 策略:
     *   - label 使用主语言的 label（各语言族 label 基本一致）
     *   - guide 以主语言为主体，追加次要语言的差异化要点
     *   - 如果主语言和次要语言属于同一语言族，跳过（避免重复）
     *
     * @param dimensions
     * @param primary 主语言 ID
     * @param secondary 次要语言 ID 列表
     * @returns >} 原数组引用
     */
    static applyMulti(dimensions: Array<{
        id: string;
        label: string;
        guide: string;
    }>, primary: string, secondary?: string[]): {
        id: string;
        label: string;
        guide: string;
    }[];
    /** 获取所有已有文案的维度 ID 列表 */
    static registeredDimIds(): string[];
    /** 获取某维度所有可用语言族 */
    static availableFamilies(dimId: string): string[];
}
export default DimensionCopy;
