/** KnowledgeEntry 领域层统一导出 */
export { KnowledgeEntry } from './KnowledgeEntry.js';
export { KnowledgeRepository } from './KnowledgeRepository.js';
export type { LifecycleFilter } from './Lifecycle.js';
export { CANDIDATE_LIFECYCLES, CANDIDATE_STATES, CONSUMABLE_LIFECYCLES, CONSUMABLE_STATES, COUNTABLE_LIFECYCLES, DEGRADED_STATES, GUARD_LIFECYCLES, inferKind, isCandidate, isConsumable, isDegraded, isValidLifecycle, isValidTransition, Lifecycle, lifecycleInSql, NON_DEPRECATED_LIFECYCLES, PUBLISHED_LIFECYCLES, } from './Lifecycle.js';
export { Constraints } from './values/Constraints.js';
export { Content } from './values/Content.js';
export { Quality } from './values/Quality.js';
export { Reasoning } from './values/Reasoning.js';
export { RELATION_BUCKETS, Relations } from './values/Relations.js';
export { Stats } from './values/Stats.js';
