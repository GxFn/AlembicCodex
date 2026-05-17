/**
 * FieldSpec.js — V3 知识条目字段规范（唯一权威来源）
 *
 * 字段分级:
 *   REQUIRED  — 缺少则立即拒绝（19 个顶层字段 + 4 个嵌套字段）
 *   EXPECTED  — 缺少则 warning + suggestions，不阻塞入库
 *   OPTIONAL  — 缺少不报任何问题
 *
 * 判决依据: 从核心消费方 (Search, Guard, Quality, 插件适配层) 反推，
 * 以「缺少时的实际损害」为唯一标准。
 *
 * 消费方:
 *   - UnifiedValidator.js       → 字段完整性检查
 *   - dimension-text.js         → SUBMISSION_SCHEMA / REQUIRED_FIELDS_DESCRIPTION
 *   - bootstrap-producer.js      → STYLE_GUIDE 字段列表
 *   - MissionBriefingBuilder.js → submissionSpec 字段描述
 *   - lifecycle.js              → JSON Schema required 数组
 *   - consolidated.js           → 前置校验
 *
 * @module shared/FieldSpec
 */
export declare const FieldLevel: Readonly<{
    REQUIRED: "required";
    EXPECTED: "expected";
    OPTIONAL: "optional";
}>;
export declare const V3_FIELD_SPEC: ({
    name: string;
    level: "required";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected?: undefined;
} | {
    name: string;
    level: "required";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected: boolean;
} | {
    name: string;
    level: "expected";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected: boolean;
} | {
    name: string;
    level: "expected";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected?: undefined;
} | {
    name: string;
    level: "optional";
    type: string;
    rule: string;
    pipeline?: undefined;
    systemInjected?: undefined;
})[];
export declare const STANDARD_CATEGORIES: string[];
/** category 白名单 — 保留历史维度 ID 兼容；新写入应使用 dimensionId 表示维度归属 */
export declare const WHITELISTED_CATEGORIES: string[];
export declare const VALID_KINDS: string[];
export declare const VALID_TOPIC_HINTS: string[];
/** 获取所有 REQUIRED 级别的顶层字段名 */
export declare function getRequiredFieldNames(): string[];
/** 获取所有 REQUIRED 级别的字段名（含嵌套） */
export declare function getAllRequiredFieldNames(): string[];
/** 获取 EXPECTED 级别字段名 */
export declare function getExpectedFieldNames(): string[];
/** 获取 AI 在外部路径必须提供的字段（= REQUIRED 全集，因无系统注入） */
export declare function getExternalAgentRequiredFields(): string[];
/** 获取 AI 在内部路径必须提供的字段（排除系统注入字段） */
export declare function getInternalAgentRequiredFields(): string[];
/** 获取系统注入的字段名列表 */
export declare function getSystemInjectedFields(): string[];
/** 生成人类友好的字段说明列表（供拒绝反馈使用） */
export declare function getRequiredFieldsDescription(): string[];
/** 根据字段名获取规范定义 */
export declare function getFieldDef(name: string): {
    name: string;
    level: "required";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected?: undefined;
} | {
    name: string;
    level: "required";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected: boolean;
} | {
    name: string;
    level: "expected";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected: boolean;
} | {
    name: string;
    level: "expected";
    type: string;
    rule: string;
    pipeline: string;
    systemInjected?: undefined;
} | {
    name: string;
    level: "optional";
    type: string;
    rule: string;
    pipeline?: undefined;
    systemInjected?: undefined;
} | undefined;
/**
 * 生成插件适配字段描述对象（供 MissionBriefingBuilder.submissionSpec.adapterFields）
 *
 * 从 V3_FIELD_SPEC 中提取 trigger/kind/doClause/dontClause/whenClause/coreCode 的 rule，
 * 并标记 REQUIRED 级别为【必填】前缀。
 */
export declare function getAgentAdapterFieldSpec(): Record<string, string>;
/**
 * 兼容 Alembic 外层历史调用名。
 * Core 内部使用宿主无关的 agent adapter 命名；Cursor 交付语义由外层 adapter 解释。
 */
export declare const getCursorDeliverySpec: typeof getAgentAdapterFieldSpec;
/**
 * 按 level 分组返回字段
 * @returns }
 */
export declare function getFieldsByLevel(): {
    required: ({
        name: string;
        level: "required";
        type: string;
        rule: string;
        pipeline: string;
        systemInjected?: undefined;
    } | {
        name: string;
        level: "required";
        type: string;
        rule: string;
        pipeline: string;
        systemInjected: boolean;
    })[];
    expected: ({
        name: string;
        level: "expected";
        type: string;
        rule: string;
        pipeline: string;
        systemInjected: boolean;
    } | {
        name: string;
        level: "expected";
        type: string;
        rule: string;
        pipeline: string;
        systemInjected?: undefined;
    })[];
    optional: {
        name: string;
        level: "optional";
        type: string;
        rule: string;
        pipeline?: undefined;
        systemInjected?: undefined;
    }[];
};
