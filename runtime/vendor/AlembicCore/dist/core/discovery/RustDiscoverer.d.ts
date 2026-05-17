/**
 * @module RustDiscoverer
 * @description Rust 项目结构发现器
 *
 * 检测信号: Cargo.toml, Cargo.lock, *.rs
 * 支持: 单 crate 项目、Cargo workspace（多 crate）、标准目录布局 (src/ tests/ benches/ examples/)
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class RustDiscoverer extends ProjectDiscoverer {
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
