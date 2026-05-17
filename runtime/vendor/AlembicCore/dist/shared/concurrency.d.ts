/**
 * concurrency.ts — 统一并发控制工具
 *
 * 基于 p-limit 提供项目级并发 preset，替代手写 Semaphore / 滑动窗口。
 *
 * 用法:
 *   import { ioLimit, cpuLimit } from '#shared/concurrency.js';
 *   const results = await Promise.all(items.map(item => ioLimit(() => process(item))));
 *
 * 动态并发（按运行时配置）:
 *   import { createLimit } from '#shared/concurrency.js';
 *   const limit = createLimit(tierConfig.concurrency);
 *
 * @module shared/concurrency
 */
import { type LimitFunction } from 'p-limit';
/** IO 密集型（文件读写、DB 查询、本地向量操作） */
export declare const ioLimit: LimitFunction;
/** CPU 密集型（AST 解析、BM25 搜索） */
export declare const cpuLimit: LimitFunction;
/**
 * 创建自定义并发限制器
 *
 * @param concurrency 最大并发数
 * @returns p-limit 实例
 */
export declare function createLimit(concurrency: number): LimitFunction;
declare const _default: {
    ioLimit: LimitFunction;
    cpuLimit: LimitFunction;
    createLimit: typeof createLimit;
};
export default _default;
