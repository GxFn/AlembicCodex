/**
 * FastAPI Enhancement Pack
 * 条件: { languages: ['python'], frameworks: ['fastapi'] }
 *
 * 覆盖 FastAPI 全栈生态:
 *   - 路由装饰器 + Pydantic 模型
 *   - Depends() 依赖注入
 *   - Middleware / CORS / BackgroundTask
 *   - WebSocket
 *   - SQLAlchemy / Tortoise ORM 集成模式
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class FastAPIEnhancement extends EnhancementPack {
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
export declare const pack: FastAPIEnhancement;
export {};
