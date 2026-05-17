/**
 * AgentModule — plugin-mode compatibility registration.
 *
 * AlembicPlugin no longer registers local agent runtime or terminal execution
 * services. Keep SkillHooks because Codex plugin delivery still needs skill
 * lifecycle hooks.
 */
import { SkillHooks } from '../../service/skills/SkillHooks.js';
export function register(c) {
    c.singleton('skillHooks', () => {
        const hooks = new SkillHooks();
        hooks.load().catch(() => {
            /* skill hooks load is best-effort */
        });
        return hooks;
    });
}
