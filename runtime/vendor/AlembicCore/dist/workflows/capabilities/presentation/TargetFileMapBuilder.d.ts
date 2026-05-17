export interface TargetFile {
    name: string;
    relativePath: string;
    language: string;
    totalLines: number;
    priority: string;
    content: string;
    truncated: boolean;
}
interface SourceFile {
    name: string;
    relativePath: string;
    targetName: string;
    content: string;
}
export declare function buildTargetFileMap(allFiles: SourceFile[], contentMaxLines: number, sort?: boolean): Record<string, TargetFile[]>;
export {};
