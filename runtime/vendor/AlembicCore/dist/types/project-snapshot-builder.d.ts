/**
 * ProjectSnapshot Builder — 从 runAllPhases() 的松散返回值构建类型化快照
 *
 * 职责：
 *   1. 类型归一化（unknown → typed interfaces）
 *   2. 默认值填充
 *   3. 不可变冻结（Object.freeze）
 *
 * @module types/project-snapshot-builder
 */
import type { ProjectSnapshot, ProjectSnapshotInput } from './project-snapshot.js';
/**
 * 从 runAllPhases() 的松散返回值构建类型化的 ProjectSnapshot。
 *
 * @param input runAllPhases() 返回值 + 额外的上下文信息
 * @returns 不可变的 ProjectSnapshot 对象
 */
export declare function buildProjectSnapshot(input: ProjectSnapshotInput): ProjectSnapshot;
