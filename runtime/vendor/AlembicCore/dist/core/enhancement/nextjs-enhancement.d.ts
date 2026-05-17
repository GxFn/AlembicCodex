/**
 * Next.js 15 Enhancement Pack
 * 条件: { languages: ['typescript', 'javascript'], frameworks: ['nextjs'] }
 *
 * 覆盖 Next.js 15 App Router 生态:
 *   - App Router 文件约定 (layout/page/loading/error/not-found/route)
 *   - Server Actions ("use server")
 *   - Metadata API (generateMetadata / export metadata)
 *   - Middleware (middleware.ts)
 *   - RSC 数据获取模式 (async Server Components / fetch cache)
 *   - Parallel Routes / Intercepting Routes
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class NextjsEnhancement extends EnhancementPack {
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
export declare const pack: NextjsEnhancement;
export {};
