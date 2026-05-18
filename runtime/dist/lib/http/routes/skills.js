/**
 * Skills API 路由
 * 管理 Agent Skills 的查询、加载和创建（项目级）
 */
import express from 'express';
import { CreateSkillBody, UpdateSkillBody } from '#shared/schemas/http-requests.js';
import { createSkill, deleteSkill, listSkills, loadSkill, updateSkill, } from '../../external/mcp/handlers/skill.js';
import { validate } from '../middleware/validate.js';
const router = express.Router();
/**
 * GET /api/v1/skills
 * 列出所有可用 Skills（内置 + 项目级）
 */
router.get('/', async (_req, res) => {
    const raw = listSkills();
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return void res.status(500).json({
            success: false,
            error: { code: 'PARSE_ERROR', message: 'Invalid response from listSkills' },
        });
    }
    if (!parsed.success) {
        return void res.status(500).json(parsed);
    }
    res.json({ success: true, data: parsed.data });
});
/**
 * GET /api/v1/skills/:name
 * 加载指定 Skill 的完整文档
 * Query: ?section=xxx 可只返回指定章节
 */
router.get('/:name', async (req, res) => {
    const { name } = req.params;
    const { section } = req.query;
    const raw = loadSkill(null, {
        skillName: name,
        section: section,
    });
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return void res.status(500).json({
            success: false,
            error: { code: 'PARSE_ERROR', message: 'Invalid response from loadSkill' },
        });
    }
    if (!parsed.success) {
        const status = parsed.error?.code === 'SKILL_NOT_FOUND' ? 404 : 400;
        return void res.status(status).json(parsed);
    }
    res.json({ success: true, data: parsed.data });
});
/**
 * POST /api/v1/skills
 * 创建项目级 Skill
 * Body: { name, description, content, overwrite? }
 */
router.post('/', validate(CreateSkillBody), async (req, res) => {
    const { name, description, content, overwrite, createdBy } = req.body;
    const raw = createSkill(null, {
        name,
        description,
        content,
        overwrite,
        createdBy: createdBy || 'manual',
    });
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return void res.status(500).json({
            success: false,
            error: { code: 'PARSE_ERROR', message: 'Invalid response from createSkill' },
        });
    }
    if (!parsed.success) {
        const status = parsed.error?.code === 'BUILTIN_CONFLICT'
            ? 409
            : parsed.error?.code === 'ALREADY_EXISTS'
                ? 409
                : parsed.error?.code === 'INVALID_NAME'
                    ? 400
                    : 500;
        return void res.status(status).json(parsed);
    }
    res.status(201).json({ success: true, data: parsed.data });
});
/**
 * PUT /api/v1/skills/:name
 * 更新项目级 Skill（description / content）
 */
router.put('/:name', validate(UpdateSkillBody), async (req, res) => {
    const { name } = req.params;
    const { description, content } = req.body;
    const raw = updateSkill(null, { name: name, description, content });
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return void res.status(500).json({
            success: false,
            error: { code: 'PARSE_ERROR', message: 'Invalid response from updateSkill' },
        });
    }
    if (!parsed.success) {
        const status = parsed.error?.code === 'SKILL_NOT_FOUND'
            ? 404
            : parsed.error?.code === 'BUILTIN_PROTECTED'
                ? 403
                : 500;
        return void res.status(status).json(parsed);
    }
    res.json({ success: true, data: parsed.data });
});
/**
 * DELETE /api/v1/skills/:name
 * 删除项目级 Skill
 */
router.delete('/:name', async (req, res) => {
    const { name } = req.params;
    const raw = deleteSkill(null, { name: name });
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return void res.status(500).json({
            success: false,
            error: { code: 'PARSE_ERROR', message: 'Invalid response from deleteSkill' },
        });
    }
    if (!parsed.success) {
        const status = parsed.error?.code === 'SKILL_NOT_FOUND'
            ? 404
            : parsed.error?.code === 'BUILTIN_PROTECTED'
                ? 403
                : 500;
        return void res.status(status).json(parsed);
    }
    res.json({ success: true, data: parsed.data });
});
export default router;
