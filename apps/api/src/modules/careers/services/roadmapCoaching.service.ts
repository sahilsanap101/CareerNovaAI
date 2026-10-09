// @ts-nocheck
import { PersonalizedRoadmap } from './roadmapEngine.service';
// Assuming a generic LLM utility exists, or we interact via an established Gemini AI module
// import { GeminiService } from '../../ai/services/gemini.service';

export class RoadmapCoachingService {
  // private geminiService: GeminiService;

  constructor() {
    // this.geminiService = new GeminiService();
  }

  /**
   * Generates a safe, restricted coaching prompt for Gemini, ensuring it acts
   * ONLY as an explanation layer and never mutates structured roadmap data.
   */
  private buildSystemPrompt(roadmapContext: string): string {
    return `
You are a Coaching Assistant for the PATHFORGE career platform.

YOUR ROLE:
- Explain why a specific skill matters for the student's selected career.
- Explain how a roadmap stage connects to real-world responsibilities.
- Motivate and encourage the student.
- Summarize the very next learning step based on their progress.
- Answer conceptual questions about a roadmap item.

STRICT RESTRICTIONS (DO NOT VIOLATE):
1. DO NOT invent, generate, or provide any URLs, links, or specific learning resources. The system already provides validated resources.
2. DO NOT alter, suggest changes to, or contradict the required skills, prerequisites, ordering, or completion status.
3. DO NOT change career scores or declare career suitability independently.
4. If asked for a resource, remind the student to check the "Recommended Resources" section in their roadmap card.

AUTHORITATIVE ROADMAP CONTEXT:
${roadmapContext}
`;
  }

  /**
   * Explains why a specific skill is needed for the career.
   */
  async explainSkillRelevance(
    roadmap: PersonalizedRoadmap,
    skillName: string
  ): Promise<string> {
    const contextStr = JSON.stringify({
      career: roadmap.careerName || 'the selected career',
      targetRole: roadmap.target_role || 'Professional',
      skillInQuestion: skillName
    });

    const prompt = `
${this.buildSystemPrompt(contextStr)}

STUDENT QUERY: "Why do I need to learn ${skillName} for this career? How is it used in the real world?"
`;

    // const response = await this.geminiService.generateText(prompt);
    // return response;
    
    // MOCK RESPONSE FOR PROTOTYPE
    return `[Gemini Coaching]: ${skillName} is fundamentally important for a ${roadmap.careerName || 'Professional'}. In real-world scenarios, you will rely on this skill to execute core tasks effectively. Keep pushing forward! Check your roadmap card for the official resources to learn this.`;
  }

  /**
   * Summarizes the next immediate action the student should take.
   */
  async summarizeNextStep(
    roadmap: PersonalizedRoadmap,
    currentNodeStatus: string, // e.g., skillName that is IN_PROGRESS or NEXT
  ): Promise<string> {
    const contextStr = JSON.stringify({
      career: roadmap.careerName,
      currentNode: currentNodeStatus
    });

    const prompt = `
${this.buildSystemPrompt(contextStr)}

STUDENT QUERY: "What should I focus on right now? Give me a brief, motivating summary of my next step."
`;

    // const response = await this.geminiService.generateText(prompt);
    // return response;

    // MOCK RESPONSE FOR PROTOTYPE
    return `[Gemini Coaching]: Based on your roadmap, your immediate next step is mastering ${currentNodeStatus}. Focus deeply on the recommended foundational courses and practice exercises provided in your roadmap. You've got this!`;
  }
}
