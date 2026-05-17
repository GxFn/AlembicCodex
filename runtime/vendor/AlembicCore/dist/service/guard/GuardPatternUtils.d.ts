/**
 * GuardPatternUtils - Guard 模式匹配与掩码工具函数
 *
 * 从 GuardCheckEngine 拆分，包含:
 * - compilePattern: 正则编译（带缓存）
 * - clearPatternCache: 清除正则缓存
 * - buildTestBlockMask: 测试块掩码（Rust #[cfg(test)]）
 * - buildCommentMask: 注释行掩码
 * - detectLanguage: 文件扩展名推断语言
 */
/** 编译正则模式（支持 RegExp 对象和 string，带缓存） */
export declare function compilePattern(pattern: RegExp | string): any;
/** 清除正则缓存 */
export declare function clearPatternCache(): void;
/**
 * 构建内联测试块掩码
 * 目前支持 Rust #[cfg(test)] mod xxx { ... } 块
 * @returns 每行是否在测试块内
 */
export declare function buildTestBlockMask(lines: string[], language: string): any[];
/**
 * 构建注释行掩码 — 识别行注释和块注释内部行
 *
 * 支持的注释形式:
 *   // 行注释,  /// 文档注释,  //! 内部文档注释  (C/Java/JS/TS/Go/Rust/Swift/Kotlin/Dart)
 *   # 行注释  (Python)
 *   /* ... * / 块注释  (C/Java/JS/TS/Go/Rust/Swift/Kotlin)
 *   \"\"\" ... \"\"\"  (Python doc-string — 简化: 整行以 \"\"\" 开头的行)
 *
 * @returns 每行是否为注释行
 */
export declare function buildCommentMask(lines: string[], language: string): any[];
/** 从文件扩展名推断语言 */
export declare function detectLanguage(filePath: string): string;
