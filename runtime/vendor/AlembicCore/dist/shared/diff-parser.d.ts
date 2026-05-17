/**
 * diff-parser — Git diff 获取与解析
 *
 * 通过 `git diff -U0` 获取文件的行级变更内容，
 * 解析 unified diff 格式，提取变更行中的代码标识符。
 *
 * @module shared/diff-parser
 */
export interface DiffHunk {
    /** 删除的行（- 前缀，已去掉前缀） */
    removedLines: string[];
    /** 新增的行（+ 前缀，已去掉前缀） */
    addedLines: string[];
}
/**
 * 获取文件的 git diff 内容（unified format，零上下文行）。
 *
 * @param projectRoot 项目根目录绝对路径
 * @param relativePath 相对于项目根的文件路径
 * @returns diff 文本，或 null（无 git / untracked / 无变更）
 */
export declare function getFileDiff(projectRoot: string, relativePath: string): string | null;
/**
 * 解析 unified diff 文本，提取变更行。
 *
 * 忽略 @@ 头、文件头（---/+++）、上下文行（无 +/- 前缀的行）。
 */
export declare function parseDiffHunks(diffText: string): DiffHunk[];
/**
 * 从 diff hunks 中提取所有代码标识符。
 *
 * 同时包含 removed 和 added 行：
 *   - removed：捕获「删除了 Recipe 描述的 API」
 *   - added：捕获「新增了与 Recipe 冲突的 API」
 */
export declare function tokenizeDiffLines(hunks: DiffHunk[]): Set<string>;
