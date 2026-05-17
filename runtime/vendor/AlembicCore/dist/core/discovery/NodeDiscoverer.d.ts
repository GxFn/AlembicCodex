/**
 * @module NodeDiscoverer
 * @description TypeScript / JavaScript 项目结构发现器
 *
 * 检测信号: package.json, tsconfig.json, node_modules/
 * 支持: 单包、Monorepo (npm/pnpm/yarn workspaces, lerna)
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class NodeDiscoverer extends ProjectDiscoverer {
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
