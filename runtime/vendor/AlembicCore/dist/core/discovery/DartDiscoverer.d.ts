/**
 * @module DartDiscoverer
 * @description Dart / Flutter 项目结构发现器
 *
 * 检测信号: pubspec.yaml, pubspec.lock, .dart_tool/, *.dart
 * 支持: 单 Package 项目、Flutter 应用、Melos 多包工作区
 */
import { type DependencyGraph, type DiscoveredFile, type DiscoveredTarget, ProjectDiscoverer } from './ProjectDiscoverer.js';
export declare class DartDiscoverer extends ProjectDiscoverer {
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
