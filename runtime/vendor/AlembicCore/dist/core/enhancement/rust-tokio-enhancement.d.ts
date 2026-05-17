/**
 * Rust Tokio Async Enhancement Pack
 * 条件: { languages: ['rust'], frameworks: ['tokio', 'async-std'] }
 *
 * 覆盖 Rust 异步运行时生态:
 *   - Tokio runtime (最主流)
 *   - async-std
 *   - 异步任务 spawn / JoinHandle
 *   - Channel (mpsc/oneshot/broadcast/watch)
 *   - 同步原语 (Mutex/RwLock/Semaphore)
 *   - 超时与取消 (select!, timeout)
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class RustTokioEnhancement extends EnhancementPack {
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
export declare const pack: RustTokioEnhancement;
export {};
