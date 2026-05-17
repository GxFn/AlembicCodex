/**
 * 全局常量注册表 — 集中管理所有魔法数字和阈值
 *
 * 取代散落在各模块中的硬编码数字，方便统一调参和文档化。
 *
 * @module shared/constants
 */
/** QualityScorer v2 维度权重 */
export declare const QUALITY_WEIGHTS: Readonly<{
    completeness: 0.25;
    contentDepth: 0.3;
    deliveryReady: 0.2;
    actionability: 0.15;
    provenance: 0.1;
}>;
/** QualityScorer 等级分界线 */
export declare const QUALITY_GRADES: Readonly<{
    A: 0.85;
    B: 0.7;
    C: 0.55;
    D: 0.35;
}>;
/** 代码质量评估 — 合理长度范围 */
export declare const CODE_LENGTH: Readonly<{
    MIN: 10;
    MAX: 5000;
}>;
/** RuleLearner 规则健康阈值 */
export declare const RULE_LEARNER: Readonly<{
    /** 触发高误报规则的条件 */
    PROBLEMATIC_FALSE_POSITIVE_RATE: 0.3;
    PROBLEMATIC_MIN_TRIGGERS: 5;
    /** 规则建议置信度 */
    CONFIDENCE_TUNE: 0.7;
    CONFIDENCE_DISABLE: 0.8;
    CONFIDENCE_SPECIALIZE: 0.6;
    CONFIDENCE_REVIEW: 0.4;
    /** 触发数阈值 */
    HIGH_TRIGGER_COUNT: 50;
    HIGH_PRECISION: 0.8;
    /** 闲置天数阈值 */
    UNUSED_DAYS_THRESHOLD: 30;
    /** 精度下限 */
    LOW_PRECISION: 0.5;
}>;
/** ComplianceReporter 默认 Quality Gate */
export declare const QUALITY_GATE: Readonly<{
    MAX_ERRORS: 0;
    MAX_WARNINGS: 20;
    MIN_SCORE: 70;
}>;
/** ComplianceReporter 扣分权重 */
export declare const COMPLIANCE_SCORING: Readonly<{
    ERROR_PENALTY: 5;
    WARNING_PENALTY: 1;
    INFO_PENALTY: 0.2;
    PROBLEMATIC_RULE_PENALTY: 3;
    HIGH_F1_BONUS: 5;
    HIGH_F1_THRESHOLD: 0.8;
    LOW_PRECISION_THRESHOLD: 0.5;
    MAX_FILES_DEFAULT: 500;
}>;
/** 知识条目默认置信度和阈值 */
export declare const KNOWLEDGE_CONFIDENCE: Readonly<{
    /** 默认 confidence（Reasoning VO） */
    DEFAULT: 0.7;
    /** pending 条目纳入交付的最低 confidence */
    PENDING_MIN: 0.7;
    /** rankScore 中 confidence 缺省值 */
    RANK_DEFAULT: 0.5;
    /** Bootstrap refine 时的 AI 默认 confidence */
    BOOTSTRAP_DEFAULT: 0.6;
    /** 自动提交时的 bootstrap confidence */
    BOOTSTRAP_SUBMIT: 0.8;
}>;
/** SearchEngine 配置 */
export declare const SEARCH: Readonly<{
    DEFAULT_LIMIT: 10;
    MAX_RESULTS: 100;
}>;
/** AiProvider 熔断配置 */
export declare const AI_CIRCUIT_BREAKER: Readonly<{
    FAILURE_THRESHOLD: 5;
}>;
/** ToolResultCache 配置 */
export declare const CACHE: Readonly<{
    MAX_FILE_ENTRIES: 200;
    MAX_SEARCH_ENTRIES: 500;
    /** 缓存条目默认 TTL（毫秒），0 = 不过期 */
    DEFAULT_TTL_MS: number;
}>;
/** PerformanceMonitor 配置 */
export declare const MONITORING: Readonly<{
    SLOW_REQUEST_THRESHOLD_MS: 1000;
    ERROR_ALERT_THRESHOLD: 10;
}>;
declare const _default: {
    QUALITY_WEIGHTS: Readonly<{
        completeness: 0.25;
        contentDepth: 0.3;
        deliveryReady: 0.2;
        actionability: 0.15;
        provenance: 0.1;
    }>;
    QUALITY_GRADES: Readonly<{
        A: 0.85;
        B: 0.7;
        C: 0.55;
        D: 0.35;
    }>;
    CODE_LENGTH: Readonly<{
        MIN: 10;
        MAX: 5000;
    }>;
    RULE_LEARNER: Readonly<{
        /** 触发高误报规则的条件 */
        PROBLEMATIC_FALSE_POSITIVE_RATE: 0.3;
        PROBLEMATIC_MIN_TRIGGERS: 5;
        /** 规则建议置信度 */
        CONFIDENCE_TUNE: 0.7;
        CONFIDENCE_DISABLE: 0.8;
        CONFIDENCE_SPECIALIZE: 0.6;
        CONFIDENCE_REVIEW: 0.4;
        /** 触发数阈值 */
        HIGH_TRIGGER_COUNT: 50;
        HIGH_PRECISION: 0.8;
        /** 闲置天数阈值 */
        UNUSED_DAYS_THRESHOLD: 30;
        /** 精度下限 */
        LOW_PRECISION: 0.5;
    }>;
    QUALITY_GATE: Readonly<{
        MAX_ERRORS: 0;
        MAX_WARNINGS: 20;
        MIN_SCORE: 70;
    }>;
    COMPLIANCE_SCORING: Readonly<{
        ERROR_PENALTY: 5;
        WARNING_PENALTY: 1;
        INFO_PENALTY: 0.2;
        PROBLEMATIC_RULE_PENALTY: 3;
        HIGH_F1_BONUS: 5;
        HIGH_F1_THRESHOLD: 0.8;
        LOW_PRECISION_THRESHOLD: 0.5;
        MAX_FILES_DEFAULT: 500;
    }>;
    KNOWLEDGE_CONFIDENCE: Readonly<{
        /** 默认 confidence（Reasoning VO） */
        DEFAULT: 0.7;
        /** pending 条目纳入交付的最低 confidence */
        PENDING_MIN: 0.7;
        /** rankScore 中 confidence 缺省值 */
        RANK_DEFAULT: 0.5;
        /** Bootstrap refine 时的 AI 默认 confidence */
        BOOTSTRAP_DEFAULT: 0.6;
        /** 自动提交时的 bootstrap confidence */
        BOOTSTRAP_SUBMIT: 0.8;
    }>;
    SEARCH: Readonly<{
        DEFAULT_LIMIT: 10;
        MAX_RESULTS: 100;
    }>;
    AI_CIRCUIT_BREAKER: Readonly<{
        FAILURE_THRESHOLD: 5;
    }>;
    CACHE: Readonly<{
        MAX_FILE_ENTRIES: 200;
        MAX_SEARCH_ENTRIES: 500;
        /** 缓存条目默认 TTL（毫秒），0 = 不过期 */
        DEFAULT_TTL_MS: number;
    }>;
    MONITORING: Readonly<{
        SLOW_REQUEST_THRESHOLD_MS: 1000;
        ERROR_ALERT_THRESHOLD: 10;
    }>;
};
export default _default;
