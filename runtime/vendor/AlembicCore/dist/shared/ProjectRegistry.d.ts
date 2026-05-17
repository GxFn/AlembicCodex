/**
 * ProjectRegistry — 全局项目注册表
 *
 * 存储位置：~/.asd/projects.json
 * 管理所有已注册项目的元数据，包括 Ghost 模式状态。
 *
 * 每个项目条目包含：
 *   - id: 基于 projectRoot 的 sha256 短哈希（8 位）
 *   - ghost: 是否启用 Ghost 模式
 *   - createdAt: 注册时间
 */
import type { WriteZone } from '../infrastructure/io/WriteZone.js';
export type WorkspaceMode = 'standard' | 'ghost';
export interface GhostMarker {
    kind: 'project-registry';
    registryPath: string;
    projectRoot: string;
    projectId: string;
}
export interface ProjectEntry {
    id: string;
    ghost: boolean;
    createdAt: string;
}
export interface ProjectRegistryInspection {
    inputProjectRoot: string;
    projectRoot: string;
    projectRealpath: string;
    registryPath: string;
    registered: boolean;
    entry: ProjectEntry | null;
    mode: WorkspaceMode;
    ghost: boolean;
    projectId: string | null;
    expectedProjectId: string;
    dataRoot: string;
    dataRootSource: 'project-root' | 'ghost-registry';
    workspaceExists: boolean;
    ghostMarker: GhostMarker | null;
}
export declare function getProjectRegistryDir(): string;
export declare function getProjectRegistryPath(): string;
export declare function normalizeProjectPath(projectRoot: string): string;
export declare function generateProjectId(projectRoot: string): string;
/** 获取 Ghost 模式的外置工作区根目录 */
export declare function getGhostWorkspaceDir(projectId: string): string;
export declare const ProjectRegistry: {
    /**
     * 查找项目注册信息
     * @returns ProjectEntry 或 null（未注册）
     */
    get(projectRoot: string): ProjectEntry | null;
    /**
     * 返回项目的 Ghost/标准模式判定事实。
     * 这是诊断、N0-data-location 和 resolver 的统一来源，避免手写解析 projects.json。
     */
    inspect(projectRoot: string): ProjectRegistryInspection;
    /**
     * 注册项目（幂等）
     * 如果已注册，更新 ghost 状态
     */
    register(projectRoot: string, ghost: boolean, writeZone?: WriteZone): ProjectEntry;
    /**
     * 移除项目注册
     */
    unregister(projectRoot: string, writeZone?: WriteZone): boolean;
    /**
     * 检查项目是否处于 Ghost 模式
     * 未注册的项目返回 false（标准模式）
     */
    isGhost(projectRoot: string): boolean;
    /**
     * 获取项目的外置工作区路径
     * @returns 工作区目录路径（仅 Ghost 模式项目），或 null
     */
    getWorkspaceDir(projectRoot: string): string | null;
    /**
     * 列出所有已注册项目
     */
    list(): Array<{
        projectRoot: string;
        entry: ProjectEntry;
    }>;
};
export default ProjectRegistry;
