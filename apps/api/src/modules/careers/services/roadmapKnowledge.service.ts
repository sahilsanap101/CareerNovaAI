import fs from 'fs';
import path from 'path';

export class RoadmapKnowledgeService {
  private static cachedData: any = null;
  private static careersMap: Map<string, any> = new Map();

  public static initialize() {
    // Relative to the server execution directory (apps/api/dist or apps/api depending on tsx)
    // The workspace root is PATHFORGE/PATHFORGE, API is in apps/api.
    const jsonPath = path.resolve(process.cwd(), '../../research/data/production/complete_personalized_roadmaps_careers_1_60.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);
        this.validateRoadmapData(data);
        this.cachedData = data;
        
        data.careers.forEach((career: any) => {
          if (career.career_id) {
            this.careersMap.set(career.career_id, career);
          }
          this.careersMap.set(this.normalizeName(career.name), career);
        });
        console.log(`[RoadmapKnowledgeService] Successfully loaded ${data.careers.length} careers from JSON`);
      } catch (err) {
        console.error(`[RoadmapKnowledgeService] Error loading roadmap JSON:`, err);
      }
    } else {
      console.error(`[RoadmapKnowledgeService] JSON file not found at ${jsonPath}`);
    }
  }

  private static validateRoadmapData(data: any) {
    if (!data.careers || !Array.isArray(data.careers)) {
      throw new Error("Invalid JSON: Missing 'careers' array");
    }
    const names = new Set();
    data.careers.forEach((c: any, index: number) => {
      if (!c.name || typeof c.name !== 'string') throw new Error(`Career at index ${index} missing valid 'name'`);
      if (names.has(c.name)) throw new Error(`Duplicate career name found: ${c.name}`);
      names.add(c.name);
      
      if (!c.stages || !Array.isArray(c.stages)) throw new Error(`Career '${c.name}' missing valid 'stages' array`);
      
      c.stages.forEach((s: any) => {
        if (typeof s.stage !== 'number' || !s.skills || !Array.isArray(s.skills)) {
          throw new Error(`Career '${c.name}' has invalid stage ${s.stage}`);
        }
      });
    });
  }

  public static normalizeName(name: string): string {
    return name.toLowerCase().replace(/-/g, ' ').trim();
  }

  public static getCareerByIdOrName(idOrName: string): any {
    const career = this.careersMap.get(idOrName) || this.careersMap.get(this.normalizeName(idOrName));
    return career || null;
  }

  public static getAllCareers() {
    return this.cachedData?.careers || [];
  }
}
