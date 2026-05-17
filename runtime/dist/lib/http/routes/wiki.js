/**
 * Wiki API 路由
 * 为共享 Dashboard 提供插件模式下的 Repo Wiki 读写与生成入口。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { DEFAULT_FOLDER_NAMES, resolveDataRoot, resolveProjectRoot } from '@alembic/core/workspace';
import express from 'express';
import { getServiceContainer } from '../../injection/ServiceContainer.js';
import { WikiGenerator } from '../../service/wiki/WikiGenerator.js';
const router = express.Router();
let task = { status: 'idle' };
let activeGenerator = null;
router.post('/generate', async (_req, res) => {
    const started = startWikiTask('generate');
    res.status(started ? 202 : 200).json({ success: true, data: { task } });
});
router.post('/update', async (_req, res) => {
    const started = startWikiTask('update');
    res.status(started ? 202 : 200).json({ success: true, data: { task } });
});
router.post('/abort', async (_req, res) => {
    activeGenerator?.abort();
    activeGenerator = null;
    task = {
        ...task,
        status: 'idle',
        finishedAt: Date.now(),
        message: 'Wiki generation aborted',
    };
    res.json({ success: true, data: { task } });
});
router.get('/status', async (_req, res) => {
    res.json({
        success: true,
        data: {
            task,
            wiki: getWikiInfo(),
        },
    });
});
router.get('/files', async (_req, res) => {
    const wikiDir = getWikiDir();
    if (!existsSync(wikiDir)) {
        return void res.json({ success: true, data: { files: [], exists: false } });
    }
    const files = walkWikiFiles(wikiDir)
        .filter((file) => file.endsWith('.md'))
        .map((file) => {
        const fullPath = join(wikiDir, file);
        const stat = statSync(fullPath);
        return {
            path: file,
            name: basename(file),
            size: stat.size,
            modifiedAt: stat.mtime.toISOString(),
        };
    })
        .sort((a, b) => a.path.localeCompare(b.path));
    res.json({ success: true, data: { files, exists: files.length > 0 } });
});
router.get('/file/{*filePath}', async (req, res) => {
    const filePath = getWildcardParam(req, 'filePath');
    if (!filePath) {
        return void res.status(400).json({
            success: false,
            error: { code: 'INVALID_WIKI_PATH', message: 'Wiki file path is required' },
        });
    }
    const wikiDir = getWikiDir();
    let fullPath;
    try {
        fullPath = resolveWikiPath(wikiDir, filePath);
    }
    catch (error) {
        return void res.status(400).json({
            success: false,
            error: { code: 'INVALID_WIKI_PATH', message: error.message },
        });
    }
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) {
        return void res.status(404).json({
            success: false,
            error: { code: 'WIKI_FILE_NOT_FOUND', message: `Wiki file not found: ${filePath}` },
        });
    }
    const content = readFileSync(fullPath, 'utf8');
    res.json({
        success: true,
        data: {
            path: normalizeRelativePath(relative(wikiDir, fullPath)),
            content,
            size: Buffer.byteLength(content),
        },
    });
});
function startWikiTask(mode) {
    if (task.status === 'running') {
        return false;
    }
    const generator = createWikiGenerator();
    activeGenerator = generator;
    task = {
        status: 'running',
        phase: 'init',
        progress: 0,
        message: mode === 'update' ? 'Wiki update started' : 'Wiki generation started',
        startedAt: Date.now(),
    };
    const run = mode === 'update' ? generator.update() : generator.generate();
    void run
        .then((result) => {
        const record = result;
        task = {
            ...task,
            status: record?.success ? 'done' : record?.error === 'aborted' ? 'idle' : 'error',
            progress: record?.success ? 100 : task.progress,
            finishedAt: Date.now(),
            result,
            error: record?.success || record?.error === 'aborted' ? undefined : record?.error,
            message: record?.success
                ? 'Wiki generation completed'
                : record?.error === 'aborted'
                    ? 'Wiki generation aborted'
                    : record?.error || 'Wiki generation failed',
        };
    })
        .catch((error) => {
        task = {
            ...task,
            status: 'error',
            finishedAt: Date.now(),
            error: error.message,
            message: error.message,
        };
    })
        .finally(() => {
        if (activeGenerator === generator) {
            activeGenerator = null;
        }
    });
    return true;
}
function createWikiGenerator() {
    const container = getServiceContainer();
    const projectRoot = resolveProjectRoot(container);
    const dataRoot = resolveDataRoot(container);
    return new WikiGenerator({
        projectRoot,
        dataRoot,
        moduleService: getOptionalService(container, 'moduleService'),
        knowledgeService: getOptionalService(container, 'knowledgeService'),
        projectGraph: getOptionalService(container, 'projectGraph'),
        writeZone: getOptionalService(container, 'writeZone'),
        onProgress(phase, progress, message) {
            task = { ...task, phase, progress, message };
        },
    });
}
function getOptionalService(container, name) {
    try {
        return container.get(name);
    }
    catch {
        return null;
    }
}
function getWikiDir() {
    const container = getServiceContainer();
    const dataRoot = resolveDataRoot(container);
    return join(dataRoot, DEFAULT_FOLDER_NAMES.project.knowledgeBase, DEFAULT_FOLDER_NAMES.project.wiki);
}
function getWikiInfo() {
    const wikiDir = getWikiDir();
    const metaPath = join(wikiDir, 'meta.json');
    if (!existsSync(wikiDir)) {
        return { exists: false };
    }
    const files = walkWikiFiles(wikiDir).filter((file) => file.endsWith('.md'));
    let meta = {};
    if (existsSync(metaPath)) {
        try {
            meta = JSON.parse(readFileSync(metaPath, 'utf8'));
        }
        catch {
            meta = {};
        }
    }
    return {
        exists: files.length > 0,
        generatedAt: typeof meta.generatedAt === 'string' ? meta.generatedAt : undefined,
        filesCount: files.length,
        version: typeof meta.version === 'string' ? meta.version : undefined,
        hasChanges: false,
    };
}
function walkWikiFiles(root, dir = root) {
    if (!existsSync(dir)) {
        return [];
    }
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkWikiFiles(root, fullPath));
        }
        else if (entry.isFile()) {
            files.push(normalizeRelativePath(relative(root, fullPath)));
        }
    }
    return files;
}
function getWildcardParam(req, name) {
    const value = req.params[name];
    if (Array.isArray(value)) {
        return value.join('/');
    }
    return typeof value === 'string' ? value : '';
}
function resolveWikiPath(wikiDir, filePath) {
    const root = resolve(wikiDir);
    const target = resolve(root, filePath);
    if (target !== root && !target.startsWith(`${root}${sep}`)) {
        throw new Error(`Wiki path escapes wiki directory: ${filePath}`);
    }
    return target;
}
function normalizeRelativePath(path) {
    return path.split(sep).join('/');
}
export default router;
