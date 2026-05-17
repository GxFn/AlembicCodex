/**
 * @module GoDiscoverer
 * @description Go 项目结构发现器
 *
 * 检测信号: go.mod, go.sum, *.go
 * 支持: 单 Module 项目、Go Workspace (go.work)、标准目录布局 (cmd/ internal/ pkg/)
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class GoDiscoverer extends ProjectDiscoverer {
    #private;
    get id(): string;
    get displayName(): string;
    detect(projectRoot: string): Promise<{
        match: boolean;
        confidence: number;
        reason: string;
    }>;
    load(projectRoot: string): Promise<void>;
    listTargets(): Promise<DiscoveredTarget[]>;
    getTargetFiles(target: DiscoveredTarget): Promise<DiscoveredFile[]>;
    getDependencyGraph(): Promise<DependencyGraph>;
}
