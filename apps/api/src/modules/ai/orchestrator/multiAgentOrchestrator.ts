import { generateAiCompletion, type CompletionResult } from '../gateway/aiGateway';
import { executePlatformTool } from '../tools/platformTools';

export type AgentType =
  | 'CAREER_MENTOR'
  | 'RESUME'
  | 'GITHUB'
  | 'INTERVIEW'
  | 'LEARNING'
  | 'RESEARCH'
  | 'ROADMAP';

export async function orchestrateAiRequest(
  userId: string,
  userMessage: string,
  requestedAgentType: AgentType = 'CAREER_MENTOR',
): Promise<CompletionResult> {
  // 1. Fetch platform tools context to ground the AI
  const profileToolData = await executePlatformTool('getStudentProfile', userId);
  const recToolData = await executePlatformTool('getBYSERRecommendations', userId);
  const roadmapToolData = await executePlatformTool('getActiveRoadmap', userId);

  // 2. Select system instruction template natively per agent
  let behaviorInstruction = '';
  switch (requestedAgentType) {
    case 'CAREER_MENTOR':
      behaviorInstruction = `You are the PATHFORGE Career Mentor. Your objective is to provide actionable career advice, paths, and strategy. You analyze the user's BYSER scores, skills, and academic data. Refuse to answer non-career-related questions. Guide the user step-by-step toward achieving industry readiness.`;
      break;
    case 'RESUME':
      behaviorInstruction = `You are the PATHFORGE Resume Intelligence Agent. Your goal is to review the user's resume, detect ATS keywords based on their target career, analyze their profile projects, and propose specific bullet-point improvements to make their resume stand out to technical recruiters. Note missing critical skills.`;
      break;
    case 'GITHUB':
      behaviorInstruction = `You are the PATHFORGE GitHub Intelligence Agent. You act as a senior staff software engineer auditing the user's GitHub portfolio/projects. Focus on code quality, structural maturity, technology breadth, and provide brutal but constructive feedback on how to improve open-source contributions or project structure.`;
      break;
    case 'INTERVIEW':
      behaviorInstruction = `You are the PATHFORGE Interview Coach. You conduct mock interviews. When the user asks to practice, ask them a specific Technical or Behavioral question tailored to their highest BYSER recommended career path or roadmap goal. Wait for their answer, grade it, and provide a better alternative response.`;
      break;
    case 'LEARNING':
      behaviorInstruction = `You are the PATHFORGE Learning Assistant. You provide study plans, explain complex technical concepts, and assist the user in following their active roadmap. Adapt your explanations based on their proficiency level and current college degree layout. Encourage practical applications over abstract theory.`;
      break;
    case 'RESEARCH':
      behaviorInstruction = `You are the PATHFORGE Research Assistant. Utilize your internal database logic and web intelligence to summarize papers, provide industry trends, and outline the exact technical requirements required by modern enterprise roles. Cite real-world tools and methodologies. Focus strictly on market research intelligence.`;
      break;
    default:
      behaviorInstruction = `You are a helpful PATHFORGE AI Assistant. Focus strictly on software engineering, learning, and careers.`;
      break;
  }

  const systemPrompt = `${behaviorInstruction}

== USER CONTEXT DATA ==
- Student Profile: ${profileToolData}
- BYSER Top Recommendations: ${recToolData}
- Active Roadmap: ${roadmapToolData}
=======================

You must strictly base your advice and actions on the User Context Data. Do not hallucinate previous chat histories. Provide concise formatting using markdown (such as bolding key terms and using bullet lists). Keep your response under 800 characters if possible for UX readability.`;

  // 3. Execute via native AI Gateway
  return generateAiCompletion({
    prompt: userMessage,
    systemPrompt,
    agentType: requestedAgentType,
    userId,
  });
}
