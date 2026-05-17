/**
 * @module CustomConfigDiscoverer
 * @description 自研配置文件发现器 — 识别使用非标准/自研构建系统的项目
 *
 * 两级检测策略：
 *  Level 1: 已知自研工具指纹匹配 (confidence 0.70-0.80)
 *  Level 2: 启发式目录结构探测 (confidence 0.50-0.65)
 *
 * 当前支持：
 *  - Baidu EasyBox (Boxfile + *.boxspec)
 *  - Tuist (Project.swift)
 *  - XcodeGen (project.yml)
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class CustomConfigDiscoverer extends ProjectDiscoverer {
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
