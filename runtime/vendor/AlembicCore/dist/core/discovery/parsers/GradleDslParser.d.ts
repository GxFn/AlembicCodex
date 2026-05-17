/**
 * @module GradleDslParser
 * @description Gradle DSL 轻量解析器 — 从 settings.gradle.kts / build.gradle.kts 提取项目拓扑
 *
 * 支持解析：
 *  - settings.gradle.kts: rootProject.name + include() 模块声明
 *  - build.gradle.kts: plugins {} + dependencies {} (project-to-project)
 *  - settings.gradle (Groovy 语法)
 *
 * 同时支持 Kotlin DSL 和 Groovy DSL 的正则模式。
 */
export interface ParsedGradleProject {
    rootProjectName: string;
    includedModules: GradleModule[];
    versionCatalog?: string;
}
export interface GradleModule {
    path: string;
    directory: string;
    conventionPlugin?: string;
    dependencies: GradleDep[];
}
export interface GradleDep {
    configuration: string;
    target: string;
    isProject: boolean;
}
/**
 * 解析 settings.gradle.kts / settings.gradle 内容
 * 提取 rootProject 名和所有 include 模块
 *
 * 当传入 build 文件内容时（附带 module 参数），解析 plugins 和 dependencies 到该模块上
 */
export declare function parseGradleProject(content: string, existingModule?: GradleModule): ParsedGradleProject;
/**
 * 检测 build 文件中是否使用了 Kotlin Multiplatform 插件
 */
export declare function isKmpBuildFile(content: string): boolean;
/**
 * 从 convention plugin id 推断模块角色
 * 例: "myapp.android.feature" → "feature"
 */
export declare function inferConventionRole(pluginId: string): string | undefined;
