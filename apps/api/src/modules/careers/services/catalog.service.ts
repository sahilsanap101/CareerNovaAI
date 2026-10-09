// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { cacheService } from '@/services/cache.service';
// @ts-nocheck
import { CareerKnowledgeService } from './careerKnowledge.service';

const prisma = new PrismaClient();
const CACHE_KEY = 'career_catalog_full';
const CACHE_TTL = 3600; // 1 hour

export class CareerCatalogService {
  /**
   * Fetches the entire career catalog from the knowledge base.
   * This is a read-only list for the Explore Careers page.
   */
  async getCatalog() {
    // Try to get from cache first
    const cached = await cacheService.get(CACHE_KEY);
    if (cached) return cached;

    // Fetch from the in-memory CSV knowledge base
    const careers = CareerKnowledgeService.getCareersForRecommendation();

    // Format output to be heavily structured for the UI
    const formattedCatalog = careers.map(c => {
      
      const coreSkills = c.requiredSkills
        .filter(r => r.skillType === 'CORE')
        .map(r => ({ name: r.skill.name, canonical: r.skill.canonicalName }));
        
      const importantSkills = c.requiredSkills
        .filter(r => r.skillType === 'IMPORTANT' || r.skillType === 'OPTIONAL')
        .map(r => ({ name: r.skill.name, canonical: r.skill.canonicalName }));

      const mappedInterests = c.interests.map(i => i.interest.name);

      return {
        id: c.id,
        name: c.name,
        domain: c.category,
        description: c.description || `The ${c.name} role in the ${c.category} domain.`,
        coreSkills,
        importantSkills,
        interests: mappedInterests,
        suitableStages: c.suitableStages || ['Year 1', 'Year 2', 'Year 3', 'Year 4'], // Using placeholder stages if missing from schema
        prerequisites: c.prerequisites || 'Basic understanding of computer science fundamentals.', // Mocking prereqs if missing from schema, but using actual values where possible
      };
    });

    // Cache the result
    await cacheService.set(CACHE_KEY, formattedCatalog, CACHE_TTL);

    return formattedCatalog;
  }
}
