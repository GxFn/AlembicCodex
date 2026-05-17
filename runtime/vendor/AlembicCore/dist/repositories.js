import { BootstrapRepositoryImpl, } from './repository/bootstrap/BootstrapRepository.js';
import { CodeEntityRepositoryImpl, } from './repository/code/CodeEntityRepository.js';
import { LifecycleEventRepository, } from './repository/evolution/LifecycleEventRepository.js';
import { ProposalRepository, } from './repository/evolution/ProposalRepository.js';
import { WarningRepository, } from './repository/evolution/WarningRepository.js';
import { GuardViolationRepositoryImpl, } from './repository/guard/GuardViolationRepository.js';
import { KnowledgeEdgeRepositoryImpl, } from './repository/knowledge/KnowledgeEdgeRepository.js';
import { KnowledgeRepositoryImpl } from './repository/knowledge/KnowledgeRepository.impl.js';
import { SessionRepositoryImpl, } from './repository/session/SessionRepository.js';
import { RecipeSourceRefRepositoryImpl, } from './repository/sourceref/RecipeSourceRefRepository.js';
export const ALEMBIC_REPOSITORY_KEYS = [
    'knowledgeRepository',
    'knowledgeEdgeRepository',
    'codeEntityRepository',
    'bootstrapRepository',
    'guardViolationRepository',
    'sessionRepository',
    'proposalRepository',
    'warningRepository',
    'lifecycleEventRepository',
    'recipeSourceRefRepository',
];
export function createAlembicRepositories(database) {
    const { drizzle } = resolveRepositoryDatabase(database);
    return {
        knowledgeRepository: new KnowledgeRepositoryImpl(database, drizzle),
        knowledgeEdgeRepository: new KnowledgeEdgeRepositoryImpl(drizzle),
        codeEntityRepository: new CodeEntityRepositoryImpl(drizzle),
        bootstrapRepository: new BootstrapRepositoryImpl(drizzle),
        guardViolationRepository: new GuardViolationRepositoryImpl(drizzle),
        sessionRepository: new SessionRepositoryImpl(drizzle),
        proposalRepository: new ProposalRepository(drizzle),
        warningRepository: new WarningRepository(drizzle),
        lifecycleEventRepository: new LifecycleEventRepository(drizzle),
        recipeSourceRefRepository: new RecipeSourceRefRepositoryImpl(drizzle),
    };
}
export function isAlembicRepositoryKey(value) {
    return ALEMBIC_REPOSITORY_KEYS.includes(value);
}
function resolveRepositoryDatabase(database) {
    if (!database ||
        typeof database.getDb !== 'function' ||
        typeof database.getDrizzle !== 'function') {
        throw new Error('Repository factory requires a connected Alembic database handle.');
    }
    try {
        return {
            sqlite: database.getDb(),
            drizzle: database.getDrizzle(),
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Repository factory requires a connected Alembic database: ${message}`);
    }
}
