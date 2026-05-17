import { type AlembicFolderNames, type PartialAlembicFolderNames } from './shared/folder-names.js';
export interface AlembicRuntimeOptions {
    projectRoot: string;
    dataRoot?: string;
    folderNames?: PartialAlembicFolderNames;
}
export interface AlembicRuntime {
    projectRoot: string;
    dataRoot: string;
    folderNames: AlembicFolderNames;
}
export declare function createAlembicRuntime(options: AlembicRuntimeOptions): AlembicRuntime;
