/**
 * @module PythonDiscoverer
 * @description Python 项目结构发现器
 *
 * 检测信号: pyproject.toml, setup.py, setup.cfg, requirements.txt, *.py
 * 支持: pyproject.toml (PEP 621), setup.py, src 布局, 平铺布局
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class PythonDiscoverer extends ProjectDiscoverer {
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
