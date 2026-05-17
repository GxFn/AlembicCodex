export interface AlembicFolderNames {
    package: {
        config: string;
        dashboard: string;
        injectableSkills: string;
        internalSkills: string;
        resources: string;
        templates: string;
    };
    dev: {
        chainRuns: string;
        docs: string;
        scratch: string;
    };
    global: {
        cache: string;
        root: string;
        snippets: string;
        workspaces: string;
    };
    project: {
        cache: string;
        candidates: string;
        context: string;
        knowledgeBase: string;
        logs: string;
        recipes: string;
        runtime: string;
        skills: string;
        wiki: string;
    };
}
export type PartialAlembicFolderNames = {
    [SectionKey in keyof AlembicFolderNames]?: Partial<AlembicFolderNames[SectionKey]>;
};
export declare const DEFAULT_FOLDER_NAMES: AlembicFolderNames;
export declare function validateFolderNameSegment(name: unknown, label: string): string;
export declare function resolveFolderNames(overrides?: PartialAlembicFolderNames): AlembicFolderNames;
