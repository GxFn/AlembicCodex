/**
 * @module CallSiteExtractor
 * @description Phase 5: 从 AST 中提取调用点 (Call Sites)
 *
 * 采用 Post-walk extraction（方案 B）：在 walker 的 walk() 完成后，
 * 通过二次遍历提取调用点，零修改现有 walker 逻辑。
 *
 * 职责:
 *   - 从 statement_block/block 中提取 call_expression / new_expression
 *   - 解析 callee、receiver、callType、argCount 等
 *   - 关联到所在的 className + methodName (上下文推断)
 *
 * 支持语言:
 *   - TypeScript / JavaScript / TSX (P0)
 *   - Python (P0)
 *   - Go / Java / Kotlin (P1 — via lang plugin extractCallSites)
 */
interface WalkerContext {
    callSites: CallSiteInfo[];
    [key: string]: unknown;
}
export interface CallSiteInfo {
    callee: string;
    callerMethod: string;
    callerClass: string | null;
    callType: 'function' | 'method' | 'constructor' | 'super' | 'static';
    receiver: string | null;
    receiverType: string | null;
    argCount: number;
    line: number;
    isAwait: boolean;
}
/**
 * 从 TS/JS AST root 中提取所有调用点
 * 使用 post-walk 策略，遍历已由 walker 收集的 methods/classes 来定位方法体，
 * 然后从方法体中递归提取 call_expression / new_expression。
 *
 * @param root AST root 节点
 * @param ctx walker context (含 classes, methods, callSites, references 等)
 * @param lang 语言标识
 */
export declare function extractCallSitesTS(root: TreeSitterNode, ctx: WalkerContext, lang: string): void;
/**
 * 从 Python AST root 中提取所有调用点
 *
 * @param root AST root 节点
 * @param ctx walker context
 * @param lang 语言标识
 */
export declare function extractCallSitesPython(root: TreeSitterNode, ctx: WalkerContext, lang: string): void;
/** 获取特定语言的 CallSite 提取器 */
export declare function getCallSiteExtractor(lang: string): typeof extractCallSitesTS | null;
/**
 * 默认的 CallSite 提取器 — 用于无专门提取器的语言
 * 使用通用的 call_expression 匹配策略
 */
export declare function defaultExtractCallSites(root: TreeSitterNode, ctx: WalkerContext, lang: string): void;
export {};
