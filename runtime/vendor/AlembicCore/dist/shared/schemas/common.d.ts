/**
 * common.ts — 共用基础 Zod Schema
 *
 * 提供可复用的基础校验片段，被 mcp-tools.ts / http-requests.ts 等引用。
 *
 * @module shared/schemas/common
 */
import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const KindEnum: z.ZodEnum<{
    pattern: "pattern";
    fact: "fact";
    all: "all";
    rule: "rule";
}>;
export declare const StrictKindEnum: z.ZodEnum<{
    pattern: "pattern";
    fact: "fact";
    rule: "rule";
}>;
export declare const KnowledgeTypeEnum: z.ZodEnum<{
    "code-pattern": "code-pattern";
    architecture: "architecture";
    "best-practice": "best-practice";
    "module-dependency": "module-dependency";
    "boundary-constraint": "boundary-constraint";
    "code-standard": "code-standard";
    "code-style": "code-style";
    "code-relation": "code-relation";
    "data-flow": "data-flow";
    "event-and-data-flow": "event-and-data-flow";
    solution: "solution";
    "anti-pattern": "anti-pattern";
}>;
export declare const ComplexityEnum: z.ZodEnum<{
    intermediate: "intermediate";
    beginner: "beginner";
    advanced: "advanced";
}>;
export declare const ScopeEnum: z.ZodEnum<{
    universal: "universal";
    "project-specific": "project-specific";
    "target-specific": "target-specific";
}>;
export declare const ContentSchema: z.ZodObject<{
    pattern: z.ZodOptional<z.ZodString>;
    markdown: z.ZodOptional<z.ZodString>;
    rationale: z.ZodString;
    steps: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    codeChanges: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    verification: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const ReasoningSchema: z.ZodObject<{
    whyStandard: z.ZodString;
    sources: z.ZodArray<z.ZodString>;
    confidence: z.ZodNumber;
    qualitySignals: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    alternatives: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const IdField: z.ZodString;
export declare const TitleField: z.ZodString;
export declare const LanguageField: z.ZodString;
