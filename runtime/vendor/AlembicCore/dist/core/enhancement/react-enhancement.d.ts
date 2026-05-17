/**
 * React Enhancement Pack
 * 条件: { languages: ['typescript', 'javascript'], frameworks: ['react', 'nextjs'] }
 *
 * 覆盖 React 19 生态:
 *   - Server / Client Components (RSC)
 *   - Custom Hooks + Hook 组合模式
 *   - 组件结构约定
 *   - 状态管理模式 (Context / Zustand / Jotai)
 *   - Suspense / ErrorBoundary
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class ReactEnhancement extends EnhancementPack {
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
export declare const pack: ReactEnhancement;
export {};
