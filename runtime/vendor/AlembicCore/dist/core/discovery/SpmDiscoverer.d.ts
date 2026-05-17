/**
 * @module SpmDiscoverer
 * @description SPM 项目发现器，适配 ProjectDiscoverer 接口
 *
 * 内置 Package.swift 正则解析，提供模块列表和文件遍历。
 *
 * 检测: 项目根或子目录存在 Package.swift
 */
import { ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class SpmDiscoverer extends ProjectDiscoverer {
    #private;
    get id(): string;
    get displayName(): string;
    detect(projectRoot: string): Promise<{
        match: boolean;
        confidence: number;
        reason: string;
    }>;
    load(projectRoot: string): Promise<void>;
    listTargets(): Promise<{
        name: string;
        path: string;
        type: string;
        language: string;
        metadata: Record<string, unknown>;
    }[]>;
    getTargetFiles(target: string | {
        name: string;
    }): Promise<{
        name: string;
        path: string;
        relativePath: string;
        language: string;
    }[]>;
    getDependencyGraph(): Promise<{
        nodes: {
            id: string;
            label: string;
            type: string;
            fullPath?: string;
            targetCount?: number;
            parent?: string;
            targetType?: string;
            indirect?: boolean;
        }[];
        edges: {
            from: string;
            to: string;
            type: string;
        }[];
    }>;
}
