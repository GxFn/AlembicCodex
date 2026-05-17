/**
 * config.ts — 配置文件 Zod Schemas
 *
 * 为 default.json 和 constitution.yaml 提供运行时校验，
 * 在应用启动时尽早发现配置错误。
 *
 * @module shared/schemas/config
 */
import { z } from 'zod';
/**
 * App 配置 schema — 对应 config/default.json 合并结果
 *
 * 所有 section 是 optional，使用 .passthrough() 允许扩展字段。
 * 用 safeParse 做非阻塞校验（warning 级别），不会阻止启动。
 */
export declare const AppConfigSchema: z.ZodObject<{
    database: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<{
            sqlite: "sqlite";
        }>>;
        path: z.ZodDefault<z.ZodString>;
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    server: z.ZodOptional<z.ZodObject<{
        port: z.ZodDefault<z.ZodNumber>;
        host: z.ZodDefault<z.ZodString>;
        cors: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            origin: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cache: z.ZodOptional<z.ZodObject<{
        mode: z.ZodDefault<z.ZodEnum<{
            memory: "memory";
            redis: "redis";
            none: "none";
        }>>;
        ttl: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    monitoring: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        slowRequestThreshold: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    logging: z.ZodOptional<z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<{
            error: "error";
            debug: "debug";
            info: "info";
            warn: "warn";
            silent: "silent";
        }>>;
        format: z.ZodDefault<z.ZodEnum<{
            json: "json";
            text: "text";
        }>>;
        console: z.ZodDefault<z.ZodBoolean>;
        file: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            path: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    constitution: z.ZodOptional<z.ZodObject<{
        path: z.ZodDefault<z.ZodString>;
        strictMode: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    features: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    ai: z.ZodOptional<z.ZodObject<{
        provider: z.ZodDefault<z.ZodString>;
        model: z.ZodDefault<z.ZodString>;
        temperature: z.ZodDefault<z.ZodNumber>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    vector: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        adapter: z.ZodDefault<z.ZodString>;
        dimensions: z.ZodDefault<z.ZodNumber>;
        indexPath: z.ZodDefault<z.ZodString>;
        hnsw: z.ZodOptional<z.ZodObject<{
            M: z.ZodDefault<z.ZodNumber>;
            efConstruct: z.ZodDefault<z.ZodNumber>;
            efSearch: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        quantize: z.ZodDefault<z.ZodString>;
        quantizeThreshold: z.ZodDefault<z.ZodNumber>;
        persistence: z.ZodOptional<z.ZodObject<{
            format: z.ZodDefault<z.ZodEnum<{
                json: "json";
                binary: "binary";
            }>>;
            flushIntervalMs: z.ZodDefault<z.ZodNumber>;
            flushBatchSize: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        hybrid: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            rrfK: z.ZodDefault<z.ZodNumber>;
            alpha: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    qualityGate: z.ZodOptional<z.ZodObject<{
        maxErrors: z.ZodDefault<z.ZodNumber>;
        maxWarnings: z.ZodDefault<z.ZodNumber>;
        minScore: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    guard: z.ZodOptional<z.ZodObject<{
        disabledRules: z.ZodDefault<z.ZodArray<z.ZodString>>;
        codeLevelThresholds: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodObject<{
            severity: z.ZodOptional<z.ZodString>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>>;
    taskGraph: z.ZodOptional<z.ZodObject<{
        decision: z.ZodOptional<z.ZodObject<{
            staleDays: z.ZodDefault<z.ZodNumber>;
            maxActiveInPrime: z.ZodDefault<z.ZodNumber>;
            maxStaleInPrime: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
/** Constitution schema — 对应 config/constitution.yaml */
export declare const ConstitutionSchema: z.ZodObject<{
    version: z.ZodOptional<z.ZodString>;
    effective_date: z.ZodOptional<z.ZodString>;
    capabilities: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        description: z.ZodOptional<z.ZodString>;
        probe: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        check: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    roles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        permissions: z.ZodDefault<z.ZodArray<z.ZodString>>;
        constraints: z.ZodDefault<z.ZodArray<z.ZodString>>;
        requires_capability: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    priorities: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export type ConstitutionConfigType = z.infer<typeof ConstitutionSchema>;
