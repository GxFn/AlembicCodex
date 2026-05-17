/**
 * @module DiscovererRegistry
 * @description 注册所有 Discoverer 实现，按项目根目录自动选择最佳匹配。
 *
 * 检测顺序：按 confidence 降序。多个匹配时取最高 confidence。
 * 若全部未命中，回退到 GenericDiscoverer（目录扫描兜底）。
 *
 * 支持用户偏好持久化: 当匹配模糊时，保存/加载用户选择。
 */
import type { ConflictResult } from './DiscovererPreference.js';
import type { ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class DiscovererRegistry {
    #private;
    /**
     * 注册一个 Discoverer 实现
     * @returns this 支持链式调用
     */
    register(discoverer: ProjectDiscoverer): this;
    /** 自动检测项目类型，返回最佳 Discoverer */
    detect(projectRoot: string): Promise<ProjectDiscoverer>;
    /**
     * 检测所有匹配的 Discoverer（用于混合项目）
     * 若存在用户偏好，将偏好 Discoverer 提升到首位。
     * @returns 按 confidence 降序排列的匹配结果（偏好优先）
     */
    detectAll(projectRoot: string): Promise<{
        discoverer: ProjectDiscoverer;
        confidence: number;
    }[]>;
    /**
     * 分析检测结果的冲突/模糊性
     * @returns 冲突分析结果，含 ambiguous 标记和推荐
     */
    analyzeConflict(projectRoot: string): Promise<ConflictResult>;
    /** 获取所有已注册的 Discoverer */
    getAll(): ProjectDiscoverer[];
}
