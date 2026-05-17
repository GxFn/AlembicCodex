/**
 * @module GenericDiscoverer
 * @description 通用兜底项目结构发现器
 *
 * 始终匹配，confidence 0.1。
 * 按语言统计最多的扩展名确定主语言。
 * 按顶层目录分 Target。
 */
import { type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class GenericDiscoverer extends ProjectDiscoverer {
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
    getDependencyGraph(): Promise<{
        nodes: string[];
        edges: never[];
    }>;
}
