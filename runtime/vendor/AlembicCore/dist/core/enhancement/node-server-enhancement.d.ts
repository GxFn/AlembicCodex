/**
 * Node.js Server Enhancement Pack
 * 条件: { languages: ['typescript', 'javascript'], frameworks: ['node-server', 'nestjs'] }
 *
 * 覆盖 Node.js 后端生态:
 *   - Express / Koa / Hono 中间件链
 *   - Fastify 插件体系 + Schema Validation
 *   - NestJS Module / DI / Guard / Pipe / Interceptor
 *   - 错误处理与日志中间件
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class NodeServerEnhancement extends EnhancementPack {
    get id(): string;
    get displayName(): string;
    get conditions(): {
        languages: string[];
        frameworks: string[];
    };
    getExtraDimensions(): {
        id: string;
        label: string;
        guide: string;
        tierHint: number;
        knowledgeTypes: string[];
        skillWorthy: boolean;
        dualOutput: boolean;
        skillMeta: {
            name: string;
            description: string;
        };
    }[];
    getGuardRules(): {
        ruleId: string;
        category: string;
        dimension: string;
        severity: string;
        languages: string[];
        pattern: RegExp;
        message: string;
    }[];
    detectPatterns(astSummary: AstSummary): DetectedPattern[];
}
export declare const pack: NodeServerEnhancement;
export {};
