import Logger from '../../infrastructure/logging/Logger.js';
interface KnowledgeRepositoryLike {
    create(entry: unknown): Promise<{
        id: string;
        title?: string;
    }>;
    findById(id: string): Promise<{
        id: string;
        title?: string;
        lifecycle?: string;
        constraints?: {
            guards?: {
                pattern?: string;
                severity?: string;
                message?: string;
            }[];
        };
    } | null>;
    update(id: string, data: Record<string, unknown>): Promise<unknown>;
    findActiveRules(): Promise<{
        id: string;
        title: string;
        language?: string;
        constraints?: {
            guards?: {
                pattern: string;
                severity?: string;
                message?: string;
            }[];
        };
    }[]>;
    findWithPagination(filter: Record<string, string>, opts: {
        page: number;
        pageSize: number;
    }): Promise<unknown>;
    search(keyword: string, opts: {
        page: number;
        pageSize: number;
    }): Promise<{
        data: {
            kind: string;
            knowledgeType: string;
        }[];
        total: number;
    }>;
    getStats(): Promise<unknown>;
}
interface AuditLoggerLike {
    log(entry: Record<string, unknown>): Promise<void>;
}
interface GuardCheckEngineLike {
    checkCode(code: string, language: string, options?: Record<string, unknown>): {
        ruleId: string;
        severity?: string;
        message?: string;
        line?: number;
        snippet?: string;
        fixSuggestion?: string;
        reasoning?: Record<string, unknown>;
    }[];
}
interface CreateRuleData {
    name: string;
    description: string;
    pattern?: string;
    languages?: string[];
    category?: string;
    severity?: string;
    note?: string;
    sourceReason?: string;
    type?: string;
    astQuery?: {
        queryType: string;
    };
    fixSuggestion?: string;
}
interface ActionContext {
    userId: string;
}
/**
 * GuardService
 * 管理 Guard 约束规则的生命周期 (V3: 使用 KnowledgeEntry / knowledgeRepository)
 * Guard 规则 = kind='rule' + knowledgeType='boundary-constraint' 的 KnowledgeEntry,
 * 具体 pattern 存在 constraints.guards[] 里
 */
export declare class GuardService {
    _engine: GuardCheckEngineLike | null;
    auditLogger: AuditLoggerLike;
    gateway: unknown;
    knowledgeRepository: KnowledgeRepositoryLike;
    logger: ReturnType<typeof Logger.getInstance>;
    /**
     * @param [deps] 可选依赖注入
     * @param [deps.guardCheckEngine] 核心引擎实例
     */
    constructor(knowledgeRepository: KnowledgeRepositoryLike, auditLogger: AuditLoggerLike, gateway: unknown, deps?: {
        guardCheckEngine?: GuardCheckEngineLike;
    });
    /** 创建新规则 → 创建一个 kind=rule, knowledgeType=boundary-constraint 的 KnowledgeEntry */
    createRule(data: CreateRuleData, context: ActionContext): Promise<{
        id: string;
        title?: string;
    }>;
    /** 启用规则（将 lifecycle 设为 active） */
    enableRule(ruleId: string, context: ActionContext): Promise<{
        id: string;
        title?: string;
        lifecycle?: string;
        constraints?: {
            guards?: {
                pattern?: string;
                severity?: string;
                message?: string;
            }[];
        };
    } | null>;
    /** 禁用规则（将 lifecycle 设为 deprecated） */
    disableRule(ruleId: string, reason: string, context: ActionContext): Promise<{
        id: string;
        title?: string;
        lifecycle?: string;
        constraints?: {
            guards?: {
                pattern?: string;
                severity?: string;
                message?: string;
            }[];
        };
    } | null>;
    /**
     * 检查代码是否匹配 Guard 规则
     * 优先代理到 GuardCheckEngine（完整管线: 内置 + DB + EP + Code-Level + AST），
     * 若引擎不可用则降级为仅 DB 规则的简化检查
     */
    checkCode(code: string, options?: {
        language?: string | null;
    }): Promise<{
        reasoning?: Record<string, unknown> | undefined;
        fixSuggestion?: string | undefined;
        ruleId: string;
        ruleName: string;
        severity: string;
        message: string;
        line: number | undefined;
        snippet: string | undefined;
        matchCount: number;
    }[] | {
        ruleId: string;
        ruleName: string;
        severity: string;
        message: string;
        matches: {
            match: string;
            index: number | undefined;
            line: number;
        }[];
        matchCount: number;
    }[]>;
    /**
     * 仅 DB 规则的简化检查（降级路径）
     */
    private _checkCodeDbOnly;
    /** 查询规则列表 (kind='rule' + knowledgeType='boundary-constraint') */
    listRules(filters?: Record<string, unknown>, pagination?: {
        page?: number;
        pageSize?: number;
    }): Promise<unknown>;
    /** 搜索规则 */
    searchRules(keyword: string, pagination?: {
        page?: number;
        pageSize?: number;
    }): Promise<{
        data: {
            kind: string;
            knowledgeType: string;
        }[];
        total: number;
    }>;
    /** 获取规则统计 */
    getRuleStats(): Promise<unknown>;
    /**
     * 验证创建输入
     * type='regex' 时 pattern 必须提供；type='ast' 时 astQuery 必须提供
     */
    _validateCreateInput(data: CreateRuleData): void;
}
export default GuardService;
