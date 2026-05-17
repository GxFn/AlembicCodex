/**
 * @module JvmDiscoverer
 * @description Java / Kotlin 项目结构发现器
 *
 * 检测信号: build.gradle, build.gradle.kts, pom.xml, settings.gradle
 * 支持: Gradle (单模块/多模块), Maven (单模块/多模块)
 *
 * ⚠️ 不尝试精确解析 Gradle DSL，仅用正则启发式提取关键信息
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class JvmDiscoverer extends ProjectDiscoverer {
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
