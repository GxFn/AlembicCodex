/**
 * Vue Enhancement Pack
 * 条件: { languages: ['typescript', 'javascript'], frameworks: ['vue', 'nuxt'] }
 *
 * 覆盖 Vue 3.5+ Composition API 生态:
 *   - Composable 函数 (useXxx)
 *   - Pinia Store 模式
 *   - SFC <script setup> 预处理
 *   - defineProps / defineEmits / defineModel 宏
 *   - VueRouter 导航守卫
 *   - provide/inject 依赖注入
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class VueEnhancement extends EnhancementPack {
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
    /** .vue SFC 预处理 → 提取 <script> / <script setup> 块 */
    preprocessFile(content: string, ext: string): {
        content: string;
        lang: string;
    } | null;
    detectPatterns(astSummary: AstSummary): DetectedPattern[];
}
export declare const pack: VueEnhancement;
export {};
