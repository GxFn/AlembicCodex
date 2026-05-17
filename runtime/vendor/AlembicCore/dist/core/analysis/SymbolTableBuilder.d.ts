/**
 * @module SymbolTableBuilder
 * @description Phase 5: 从 analyzeProject 结果构建全局符号表
 *
 * 符号表是调用图解析的核心数据结构，将 AST 提取的声明信息组织为可查询的全局表。
 *
 * 数据流:
 *   ProjectAstSummary → SymbolTableBuilder.build() → SymbolTable {
 *     declarations: Map<FQN, SymbolDeclaration>
 *     fileExports: Map<FilePath, string[]>
 *     fileImports: Map<FilePath, ImportRecord[]>
 *   }
 */
/** Input shape for the project summary from analyzeProject */
interface ProjectSummaryInput {
    fileSummaries?: Array<{
        file: string;
        exports?: Array<string | {
            name?: string;
            text?: string;
        }>;
        classes?: Array<{
            name?: string;
            line?: number;
            kind?: string;
        }>;
        protocols?: Array<{
            name?: string;
            line?: number;
        }>;
        methods?: Array<{
            name?: string;
            className?: string;
            line?: number;
        }>;
        imports?: unknown[];
        callSites?: Array<{
            callType?: string;
            receiverType?: string | null;
        }>;
        properties?: Array<{
            name: string;
            className?: string;
            typeAnnotation?: string;
        }>;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
}
export declare class SymbolTableBuilder {
    /**
     * 从 analyzeProject 结果构建全局符号表
     *
     * @param projectSummary analyzeProject() 返回的 ProjectAstSummary
     */
    static build(projectSummary: ProjectSummaryInput): {
        declarations: Map<any, any>;
        fileExports: Map<any, any>;
        fileImports: Map<any, any>;
        instantiatedClasses: Set<unknown>;
        propertyTypes: Map<any, any>;
    };
}
export default SymbolTableBuilder;
