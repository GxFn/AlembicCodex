import fs from 'node:fs';
import path from 'node:path';
import { getProjectSkillsPath } from '@alembic/core/config';
import { pathGuard } from '@alembic/core/io';
import { resolveDataRoot, resolveProjectRoot } from '@alembic/core/workspace';
import { buildContentHash, buildPluginProjectSkillDeliveryReceipt, exportProjectSkillReceiptToCodexRuntime, getCodexProjectSkillRoot, PROJECT_SKILL_MARKER_FILE, } from '#codex/ProjectSkillDelivery.js';
import { CODEX_HOST_AGENT_SOURCE } from '#codex/SourceBoundary.js';
import { INJECTABLE_SKILLS_DIR } from '#shared/package-assets.js';
import { countProjectSkillKnowledgeEntries } from '../../repository/skills/ProjectSkillKnowledgeRepository.js';
const KNOWLEDGE_DEPENDENT_SKILLS = [
    'alembic-recipes',
    'alembic-guard',
    'alembic-structure',
    'alembic-create',
];
/**
 * ProjectSkillService 是 AP-KS-1 后唯一的 skill 写入面：
 * source 永远写到 dataRoot/Alembic/skills，Codex runtime 永远通过
 * .agents/skills symlink 投影。这里不接 SkillHooks，也不改 tool visibility。
 */
export class ProjectSkillService {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    list() {
        const projectRoot = this.projectRoot();
        const sourceRoot = this.sourceRoot();
        const runtimeRoot = getCodexProjectSkillRoot(projectRoot);
        const builtin = listSkillDirs(INJECTABLE_SKILLS_DIR).map((name) => this.describeSkillLocation(this.builtinLocation(name)));
        const projectSource = listSkillDirs(sourceRoot).map((name) => this.describeSkillLocation(this.projectSourceLocation(name)));
        const runtimeExports = listSkillDirs(runtimeRoot).map((name) => this.describeSkillLocation(this.runtimeLocation(name)));
        const allNames = new Set([
            ...builtin.map((skill) => skill.name),
            ...projectSource.map((skill) => skill.name),
            ...runtimeExports.map((skill) => skill.name),
        ]);
        const effective = [...allNames]
            .sort((a, b) => a.localeCompare(b))
            .map((name) => this.describeSkillLocation(this.effectiveLocation(name)));
        return {
            success: true,
            data: {
                skills: effective,
                total: effective.length,
                builtIn: builtin,
                projectSource,
                codexRuntime: {
                    root: runtimeRoot,
                    exports: runtimeExports,
                    total: runtimeExports.length,
                },
                sourceRoot,
                replacementFor: 'alembic_skill',
                hint: 'Project Skills use dataRoot/Alembic/skills as source and .agents/skills symlinks as Codex runtime projection. Same-name project skills intentionally override built-in skills.',
            },
        };
    }
    load(args) {
        const name = normalizeSkillName(args);
        if (!name) {
            return failure('MISSING_PARAM', 'name is required for load.');
        }
        const location = this.effectiveLocation(name);
        if (!location.exists) {
            return failure('SKILL_NOT_FOUND', `Skill "${name}" not found.`);
        }
        let content = fs.readFileSync(location.skillPath, 'utf8');
        if (args.section) {
            content = extractSection(content, args.section);
        }
        const parsed = parseSkill(content, name);
        return {
            success: true,
            data: {
                skillName: name,
                source: location.source,
                path: location.skillPath,
                content,
                charCount: content.length,
                description: parsed.description,
                createdBy: location.source === 'builtin' ? null : parsed.createdBy,
                createdAt: location.source === 'builtin' ? null : parsed.createdAt,
                managed: location.managed,
            },
        };
    }
    upsert(args) {
        const name = normalizeSkillName(args);
        const validation = validateSkillName(name);
        if (validation) {
            return validation;
        }
        if (!name) {
            return failure('MISSING_PARAM', 'name is required.');
        }
        const source = this.projectSourceLocation(name);
        const existedBefore = fs.existsSync(source.skillPath);
        const existing = existedBefore
            ? parseSkill(fs.readFileSync(source.skillPath, 'utf8'), name)
            : null;
        if (existedBefore && args.overwrite === false && args.content && args.description) {
            return failure('ALREADY_EXISTS', `Project skill "${name}" already exists. Set overwrite=true or use update/upsert semantics.`);
        }
        if (!args.content && !existing) {
            return failure('MISSING_PARAM', 'content is required when creating a new Project Skill.');
        }
        if (!args.description && !existing) {
            return failure('MISSING_PARAM', 'description is required when creating a new Project Skill.');
        }
        const description = args.description ?? existing?.description ?? name;
        const body = args.content ?? existing?.body ?? '';
        const title = args.title ?? existing?.title ?? extractHeadingTitle(body);
        const createdBy = args.createdBy ?? existing?.createdBy ?? 'external-ai';
        const createdAt = existing?.createdAt ?? new Date().toISOString();
        const updatedAt = new Date().toISOString();
        const skillContent = buildSkillDocument({
            body,
            createdAt,
            createdBy,
            description,
            name,
            title,
            updatedAt,
        });
        const write = this.writeSourceSkill(name, skillContent);
        if (!write.success) {
            return write;
        }
        const receipt = this.buildReceipt(name, description, source.skillPath);
        this.writeSkillSidecars(name, {
            deliveryReceipt: receipt,
            description,
            managedKind: 'project-source',
            name,
            sourcePath: source.skillPath,
            updatedAt,
        });
        const exportResult = args.authorizeProjectSkillExport
            ? exportProjectSkillReceiptToCodexRuntime(this.ctx, {
                receipt,
                authorize: true,
                grantedBy: CODEX_HOST_AGENT_SOURCE,
                overwriteManaged: args.overwrite !== false,
            })
            : null;
        return {
            success: exportResult ? exportResult.runtimeExportStatus === 'exported' : true,
            errorCode: exportResult && exportResult.runtimeExportStatus !== 'exported'
                ? 'PROJECT_SKILL_EXPORT_BLOCKED'
                : null,
            message: exportResult?.receipt.shoutSummary.message ??
                `Project Skill "${name}" stored in Alembic dataRoot source storage.`,
            data: {
                skillName: name,
                path: source.skillPath,
                sourceRoot: this.sourceRoot(),
                overwritten: existedBefore,
                deliveryReceipt: exportResult?.receipt ?? receipt,
                runtimeExport: exportResult ? summarizeExportResult(exportResult) : receipt.runtimeExport,
                replacementFor: 'alembic_skill',
            },
        };
    }
    delete(args) {
        const name = normalizeSkillName(args);
        if (!name) {
            return failure('MISSING_PARAM', 'name is required.');
        }
        const source = this.projectSourceLocation(name);
        const runtime = this.runtimeLocation(name);
        const sourceExists = fs.existsSync(source.path);
        const runtimeDeleted = this.removeManagedRuntimeExport(runtime);
        if (!sourceExists && !runtimeDeleted) {
            return failure('SKILL_NOT_FOUND', `Project skill "${name}" not found.`);
        }
        if (sourceExists) {
            const removed = this.removeSourceSkill(source.path);
            if (!removed.success) {
                return removed;
            }
        }
        return {
            success: true,
            data: {
                skillName: name,
                deleted: true,
                sourceDeleted: sourceExists,
                runtimeDeleted,
                builtInProtected: fs.existsSync(this.builtinLocation(name).skillPath),
                hint: 'Deleted only Alembic project skill source/runtime projection; built-in plugin skills are read-only and remain available.',
            },
        };
    }
    export(args) {
        const name = normalizeSkillName(args);
        const receipt = normalizeReceiptInput(args.receipt) ??
            (name ? this.readStoredReceipt(name) : null) ??
            (name ? this.buildReceiptFromSource(name) : null);
        if (!receipt) {
            return failure('PROJECT_SKILL_RECEIPT_NOT_FOUND', 'ProjectSkillDeliveryReceipt was not provided and no matching source skill receipt was found.');
        }
        const result = exportProjectSkillReceiptToCodexRuntime(this.ctx, {
            receipt,
            authorize: args.authorizeProjectSkillExport === true,
            grantedBy: CODEX_HOST_AGENT_SOURCE,
            overwriteManaged: args.overwrite !== false,
        });
        if (result.runtimeExportStatus === 'exported') {
            this.writeStoredReceipt(result.receipt.skillName, result.receipt);
        }
        return {
            success: result.runtimeExportStatus === 'exported',
            errorCode: result.runtimeExportStatus === 'exported' ? null : 'PROJECT_SKILL_EXPORT_BLOCKED',
            message: result.receipt.runtimeExport.message || result.receipt.shoutSummary.message,
            data: {
                authorizationStatus: result.authorizationStatus,
                conflictStatus: result.conflictStatus,
                receipt: result.receipt,
                runtimeExportStatus: result.runtimeExportStatus,
                targetPath: result.targetPath,
            },
        };
    }
    refreshKnowledgeSkills(args = {}) {
        const scope = this.collectKnowledgeScope();
        const refreshed = [];
        const removed = [];
        if (!scope.hasKnowledgeBase) {
            for (const name of KNOWLEDGE_DEPENDENT_SKILLS) {
                const runtimeDeleted = this.removeManagedRuntimeExport(this.runtimeLocation(name));
                if (runtimeDeleted) {
                    removed.push({ skillName: name, runtimeDeleted });
                }
            }
            return {
                success: true,
                message: 'No local Alembic knowledge base was found; knowledge-dependent Project Skills were not generated.',
                data: {
                    hasKnowledgeBase: false,
                    knowledgeScope: scope,
                    refreshed,
                    removed,
                },
            };
        }
        for (const name of KNOWLEDGE_DEPENDENT_SKILLS) {
            const templatePath = path.join(INJECTABLE_SKILLS_DIR, name, 'SKILL.md');
            if (!fs.existsSync(templatePath)) {
                continue;
            }
            const template = fs.readFileSync(templatePath, 'utf8');
            const description = 'This project has a local Alembic knowledge base. Use Alembic project knowledge proactively for this project.';
            const content = buildKnowledgeScopedSkill(name, template, scope, description);
            const result = this.upsert({
                authorizeProjectSkillExport: args.authorizeProjectSkillExport !== false,
                content,
                createdBy: 'system-ai',
                description,
                name,
                overwrite: true,
            });
            refreshed.push({
                skillName: name,
                success: result.success,
                runtimeExport: result.data?.runtimeExport ?? null,
                error: result.error ?? result.errorCode ?? null,
            });
        }
        return {
            success: refreshed.every((entry) => entry.success === true),
            message: 'Knowledge-dependent Project Skills refreshed from local Alembic knowledge scope.',
            data: {
                hasKnowledgeBase: true,
                knowledgeScope: scope,
                refreshed,
            },
        };
    }
    collectKnowledgeScope() {
        const dataRoot = this.dataRoot();
        const projectRoot = this.projectRoot();
        const markdownFiles = [
            ...collectKnowledgeMarkdown(path.join(dataRoot, 'Alembic', 'candidates')),
            ...collectKnowledgeMarkdown(path.join(dataRoot, 'Alembic', 'recipes')),
        ];
        const databaseEntries = countProjectSkillKnowledgeEntries(dataRoot);
        const reasons = [];
        if (databaseEntries > 0) {
            reasons.push('knowledge_entries');
        }
        if (markdownFiles.some((file) => file.includes(`${path.sep}candidates${path.sep}`))) {
            reasons.push('candidates');
        }
        if (markdownFiles.some((file) => file.includes(`${path.sep}recipes${path.sep}`))) {
            reasons.push('recipes');
        }
        return {
            dataRoot,
            databaseEntries,
            hasKnowledgeBase: databaseEntries > 0 || markdownFiles.length > 0,
            markdownFiles,
            projectRoot,
            reasons,
        };
    }
    effectiveLocation(name) {
        const runtime = this.runtimeLocation(name);
        if (runtime.exists) {
            return runtime;
        }
        const source = this.projectSourceLocation(name);
        if (source.exists) {
            return source;
        }
        return this.builtinLocation(name);
    }
    runtimeLocation(name) {
        const skillDir = path.join(getCodexProjectSkillRoot(this.projectRoot()), name);
        return buildLocation('codex-runtime', name, skillDir);
    }
    projectSourceLocation(name) {
        return buildLocation('project-source', name, path.join(this.sourceRoot(), name));
    }
    builtinLocation(name) {
        return buildLocation('builtin', name, path.join(INJECTABLE_SKILLS_DIR, name));
    }
    describeSkillLocation(location) {
        const parsed = location.exists
            ? parseSkill(fs.readFileSync(location.skillPath, 'utf8'), location.name)
            : null;
        return {
            name: location.name,
            source: location.source,
            path: location.path,
            skillPath: location.skillPath,
            exists: location.exists,
            managed: location.managed,
            summary: parsed?.description ?? location.name,
            createdBy: location.source === 'builtin' ? null : (parsed?.createdBy ?? null),
            createdAt: location.source === 'builtin' ? null : (parsed?.createdAt ?? null),
        };
    }
    buildReceipt(name, description, sourcePath) {
        return buildPluginProjectSkillDeliveryReceipt(this.ctx, {
            skillName: name,
            description,
            sourcePath,
            contentHash: fs.existsSync(sourcePath) ? buildContentHash(fs.readFileSync(sourcePath)) : null,
            evidenceRefs: [{ kind: 'skill-file', ref: sourcePath }],
        });
    }
    buildReceiptFromSource(name) {
        const source = this.projectSourceLocation(name);
        if (!source.exists) {
            return null;
        }
        const parsed = parseSkill(fs.readFileSync(source.skillPath, 'utf8'), name);
        return this.buildReceipt(name, parsed.description, source.skillPath);
    }
    readStoredReceipt(name) {
        try {
            return JSON.parse(fs.readFileSync(path.join(this.sourceRoot(), name, 'delivery-receipt.json'), 'utf8'));
        }
        catch {
            return null;
        }
    }
    writeStoredReceipt(name, receipt) {
        const receiptPath = path.join(this.sourceRoot(), name, 'delivery-receipt.json');
        writeDataFile(this.ctx, this.dataRoot(), receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    }
    writeSkillSidecars(name, meta) {
        const skillDir = path.join(this.sourceRoot(), name);
        writeDataFile(this.ctx, this.dataRoot(), path.join(skillDir, 'skill.meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
        if (meta.deliveryReceipt) {
            this.writeStoredReceipt(name, meta.deliveryReceipt);
        }
    }
    writeSourceSkill(name, content) {
        try {
            const skillDir = path.join(this.sourceRoot(), name);
            const skillPath = path.join(skillDir, 'SKILL.md');
            writeDataFile(this.ctx, this.dataRoot(), skillPath, content);
            return { success: true };
        }
        catch (err) {
            return failure('WRITE_ERROR', `Failed to write Project Skill source: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    removeSourceSkill(skillDir) {
        try {
            const writeZone = getWriteZone(this.ctx);
            if (writeZone) {
                writeZone.remove(writeZone.data(relativeToDataRoot(writeZone.dataRoot, skillDir)), {
                    recursive: true,
                });
            }
            else {
                pathGuard.assertProjectWriteSafe(skillDir);
                fs.rmSync(skillDir, { recursive: true, force: true });
            }
            return { success: true };
        }
        catch (err) {
            return failure('DELETE_ERROR', `Failed to delete Project Skill source: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    removeManagedRuntimeExport(location) {
        if (!fs.existsSync(location.path) || !fs.existsSync(location.markerPath)) {
            return false;
        }
        try {
            const marker = JSON.parse(fs.readFileSync(location.markerPath, 'utf8'));
            if (marker.managedBy !== 'alembic') {
                return false;
            }
            pathGuard.addProjectWritePrefix('.agents');
            pathGuard.assertProjectWriteSafe(location.path);
            fs.rmSync(location.path, { recursive: true, force: true });
            return true;
        }
        catch {
            return false;
        }
    }
    dataRoot() {
        return resolveDataRoot(this.ctx?.container);
    }
    projectRoot() {
        return resolveProjectRoot(this.ctx?.container);
    }
    sourceRoot() {
        return getProjectSkillsPath(this.dataRoot());
    }
}
export function createProjectSkillService(ctx) {
    return new ProjectSkillService(ctx);
}
export function extractSection(content, section) {
    const sectionRe = new RegExp(`^##\\s+.*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$\\n([\\s\\S]*?)(?=^##\\s|$)`, 'mi');
    const match = content.match(sectionRe);
    return match ? match[0] : content;
}
function buildLocation(source, name, skillDir) {
    const skillPath = path.join(skillDir, 'SKILL.md');
    const markerPath = path.join(skillDir, PROJECT_SKILL_MARKER_FILE);
    return {
        exists: fs.existsSync(skillPath),
        managed: fs.existsSync(markerPath),
        markerPath,
        name,
        path: skillDir,
        skillPath,
        source,
    };
}
function buildSkillDocument(input) {
    const frontmatter = [
        '---',
        `name: ${input.name}`,
        ...(input.title ? [`title: "${input.title.replace(/"/g, '\\"')}"`] : []),
        `description: ${singleLine(input.description)}`,
        `createdBy: ${input.createdBy}`,
        `createdAt: ${input.createdAt}`,
        `updatedAt: ${input.updatedAt}`,
        '---',
        '',
    ].join('\n');
    return `${frontmatter}${input.body.replace(/^\n+/, '')}`;
}
function buildKnowledgeScopedSkill(name, template, scope, description) {
    const parsed = parseSkill(template, name);
    const body = [
        `# ${parsed.title ?? name}`,
        '',
        '> This project has a local Alembic knowledge base. Use Alembic Recipes, Guard, structure, and knowledge search proactively for this project when coding or answering project-standard questions.',
        '',
        '## Current Project Knowledge Scope',
        '',
        `- Project root: \`${scope.projectRoot}\``,
        `- Knowledge source: \`${scope.dataRoot}/Alembic\``,
        `- Knowledge evidence: ${scope.reasons.length > 0 ? scope.reasons.join(', ') : 'none'}`,
        `- Database entries: ${scope.databaseEntries}`,
        `- Markdown knowledge files: ${scope.markdownFiles.length}`,
        '',
        parsed.body.replace(/^# .+\n+/, ''),
    ].join('\n');
    return buildSkillDocument({
        body,
        createdAt: new Date().toISOString(),
        createdBy: 'system-ai',
        description,
        name,
        title: parsed.title,
        updatedAt: new Date().toISOString(),
    });
}
function collectKnowledgeMarkdown(root) {
    if (!fs.existsSync(root)) {
        return [];
    }
    const found = [];
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            found.push(...collectKnowledgeMarkdown(fullPath));
        }
        else if (entry.isFile() && isKnowledgeMarkdown(entry.name)) {
            found.push(fullPath);
        }
    }
    return found;
}
function isKnowledgeMarkdown(name) {
    const lower = name.toLowerCase();
    return (lower.endsWith('.md') &&
        !lower.startsWith('.') &&
        lower !== 'readme.md' &&
        !lower.includes('template'));
}
function listSkillDirs(root) {
    try {
        return fs
            .readdirSync(root, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
    }
    catch {
        return [];
    }
}
function parseSkill(content, fallbackName) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    const frontmatter = {};
    let body = content;
    if (match) {
        body = match[2] ?? '';
        for (const line of (match[1] ?? '').split('\n')) {
            const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
            if (field) {
                frontmatter[field[1]] = field[2].replace(/^"(.*)"$/, '$1').trim();
            }
        }
    }
    return {
        body,
        content,
        createdAt: frontmatter.createdAt ?? null,
        createdBy: frontmatter.createdBy ?? null,
        description: frontmatter.description ?? fallbackName,
        frontmatter,
        title: frontmatter.title ?? extractHeadingTitle(body),
    };
}
function extractHeadingTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
}
function validateSkillName(name) {
    if (!name) {
        return failure('MISSING_PARAM', 'name is required.');
    }
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) || name.length < 3 || name.length > 64) {
        return failure('INVALID_NAME', `Skill name must be kebab-case (a-z, 0-9, -), 3-64 chars. Got: "${name}"`);
    }
    return null;
}
function normalizeSkillName(args) {
    return args.skillName || args.name || null;
}
function failure(code, message) {
    return { success: false, error: { code, message }, errorCode: code, message };
}
function summarizeExportResult(result) {
    return {
        authorizationStatus: result.authorizationStatus,
        conflictStatus: result.conflictStatus,
        status: result.runtimeExportStatus,
        targetPath: result.targetPath,
    };
}
function getWriteZone(ctx) {
    return ctx?.container?.singletons?.writeZone;
}
function writeDataFile(ctx, dataRoot, absolutePath, content) {
    const writeZone = getWriteZone(ctx);
    if (writeZone) {
        const relPath = relativeToDataRoot(writeZone.dataRoot, absolutePath);
        const target = writeZone.data(relPath);
        writeZone.ensureDir(writeZone.data(path.dirname(relPath)));
        writeZone.writeFile(target, content);
        return;
    }
    pathGuard.assertProjectWriteSafe(path.dirname(absolutePath));
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf8');
}
function relativeToDataRoot(dataRoot, absolutePath) {
    const rel = path.relative(dataRoot, absolutePath);
    if (rel.startsWith('..')) {
        throw new Error(`Path is outside dataRoot: ${absolutePath}`);
    }
    return rel;
}
function singleLine(value) {
    return value.replace(/\s+/g, ' ').trim();
}
function normalizeReceiptInput(receipt) {
    if (!receipt || typeof receipt !== 'object') {
        return null;
    }
    return receipt;
}
