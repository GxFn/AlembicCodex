/**
 * @module CallEdgeResolver
 * @description Phase 5: 将调用点 (CallSite) 解析为调用边 (ResolvedEdge)
 *
 * 解析优先级 (4-priority system):
 *   1. this.xxx() — 同类方法调用
 *   2. ImportedType.method() / importedFunc() — import-based 解析
 *   3. localFunc() — 同文件内函数调用
 *   4. globalSearch(name) — 全局唯一匹配 (fallback, 低置信度)
 *
 * 数据流:
 *   SymbolTable + ImportPathResolver + CallSite[] → ResolvedEdge[]
 */
import type { ImportPathResolver } from './ImportPathResolver.js';
export interface ResolvedEdge {
    caller: string;
    callee: string;
    callType: string;
    resolveMethod: string;
    line: number;
    file: string;
    isAwait: boolean;
    argCount: number;
}
interface SymbolDeclaration {
    name: string;
    className?: string;
    kind?: string;
    file: string;
    [key: string]: unknown;
}
interface SymbolTable {
    declarations: Map<string, SymbolDeclaration>;
    fileImports: Map<string, Array<{
        path?: string;
        symbols?: string[];
        alias?: string;
        toString(): string;
    }>>;
    instantiatedClasses?: Set<string>;
    propertyTypes?: Map<string, Map<string, string>>;
}
interface CallSite {
    callee: string;
    callerMethod: string;
    callerClass: string | null;
    callType: string;
    receiver: string | null;
    receiverType: string | null;
    argCount: number;
    line: number;
    isAwait: boolean;
}
interface InheritanceEdge {
    from: string;
    to: string;
    type: string;
}
interface FileDecl {
    name: string;
    qualifiedName: string;
    fqn: string;
}
export declare class CallEdgeResolver {
    classNames: Set<string>;
    fileIndex: Map<string, FileDecl[]>;
    importResolver: ImportPathResolver;
    inheritanceGraph: InheritanceEdge[];
    instantiatedClasses: Set<string>;
    nameIndex: Map<string, string[]>;
    propertyTypes: Map<string, Map<string, string>>;
    symbolTable: SymbolTable;
    /**
     * @param [inheritanceGraph=[]] 继承图边
     */
    constructor(symbolTable: SymbolTable, importResolver: ImportPathResolver, inheritanceGraph?: InheritanceEdge[]);
    /**
     * 解析一个文件中的所有调用点为边
     *
     * @param callSites 来自某个文件的所有调用点
     * @param callerFile 调用者文件路径 (相对)
     */
    resolveFile(callSites: CallSite[], callerFile: string): ResolvedEdge[];
    /** 构建局部 import 映射 */
    _buildImportMap(fileImports: Array<{
        path?: string;
        symbols?: string[];
        alias?: string;
        toString(): string;
    }>, callerFile: string): Map<string, {
        file: string;
        namespace: boolean;
    }>;
    /** 解析单个调用点 */
    _resolveCallSite(cs: CallSite, callerFile: string, importedSymbols: Map<string, {
        file: string;
        namespace: boolean;
    }>): ResolvedEdge | null;
    /**
     * CHA (Class Hierarchy Analysis): 沿继承链向上搜索方法
     *
     * 使用 BFS 遍历 inheritanceGraph，从 className 向上搜索直到找到
     * 定义了 methodName 的祖先类。只跟踪 'inherits' 类型的边。
     *
     * @param methodName 被调用的方法名
     * @param className 起始类名
     * @returns 找到的 FQN 或 null
     */
    _resolveByCHA(methodName: string, className: string): string | null;
    /**
     * 从字段名推断类型（DI/IoC 命名约定推断）
     *
     * 常见模式:
     *   - userRepo → UserRepo
     *   - userRepository → UserRepository
     *   - userService → UserService
     *   - _userRepo → UserRepo (Java/Kotlin private field)
     *
     * 只在符号表中存在匹配类时返回
     */
    _inferFieldType(fieldName: string): string | null;
    /**
     * 在指定文件中查找声明 (使用 fileIndex 优化，避免全表扫描)
     * @param name 符号名 (可以是 "ClassName.methodName" 或 "functionName")
     * @returns 匹配的 FQN 列表
     */
    _findInFile(name: string, file: string): string[];
    /** 构建 ResolvedEdge */
    _makeEdge(callerFqn: string, calleeFqn: string, resolveMethod: string, cs: CallSite, callerFile: string): ResolvedEdge;
}
export default CallEdgeResolver;
