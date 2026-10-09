import type { Request, Response, NextFunction } from 'express';

import * as aiService from '@/modules/ai/services/ai.service';
import { sendSuccess, sendError } from '@/utils/response';
import type { AgentType } from '@/modules/ai/services/ai.service';
import { generateAiCompletion } from '@/modules/ai/gateway/aiGateway';
import { runDeterministicMatch } from '@/modules/ai/services/resumeMatcher.service';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, conversationId, agentType } = req.body as {
      message: string;
      conversationId?: string;
      agentType?: AgentType;
    };
    const data = await aiService.processChatRequest(req.user!.sub, message, conversationId, agentType);
    sendSuccess(res, { message: 'AI response generated.', data });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await aiService.getUserConversations(req.user!.sub);
    sendSuccess(res, { message: 'AI conversation history retrieved.', data });
  } catch (err) {
    next(err);
  }
}
export async function analyzeResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resumeText, jobDescription } = req.body;
    
    // 1. RESUME VALIDATION
    if (!resumeText || resumeText.trim().length === 0) {
      res.status(400).json({
        success: false,
        stage: 'RESUME_VALIDATION',
        code: 'RESUME_EMPTY',
        message: 'Resume text is missing or empty. Please ensure text extraction was successful.'
      });
      return;
    }

    if (resumeText.length < 50) {
      res.status(400).json({
        success: false,
        stage: 'RESUME_VALIDATION',
        code: 'RESUME_TOO_SHORT',
        message: 'We could not extract sufficient readable text from this resume. Please check the file.'
      });
      return;
    }

    // 2. JD VALIDATION
    if (!jobDescription || jobDescription.trim().length === 0) {
      res.status(400).json({
        success: false,
        stage: 'JD_VALIDATION',
        code: 'JD_EMPTY',
        message: 'Please paste a job description.'
      });
      return;
    }

    if (jobDescription.length < 50) {
      res.status(400).json({
        success: false,
        stage: 'JD_VALIDATION',
        code: 'JD_TOO_SHORT',
        message: 'The job description is too short for reliable analysis.'
      });
      return;
    }

    // Run the actual deterministic match
    const deterministicResult = runDeterministicMatch(resumeText, jobDescription);

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `
You are an expert ATS (Applicant Tracking System) and senior technical recruiter. 
We have already processed the deterministic matching for a candidate. 
Your ONLY job is to provide actionable semantic feedback based strictly on the provided resume and the matching results.

CRITICAL INSTRUCTIONS TO PREVENT HALLUCINATIONS:
1. DO NOT RECALCULATE SCORES: Rely completely on the provided match results.
2. NEVER INVENT METRICS: Do NOT generate numbers (e.g., 18% improvement, 5,000 users) unless they exactly exist in the resume. If a bullet needs a metric, suggest "Add a measurable result if available".
3. DATE VALIDATION: The current date is ${currentDate}. Compare resume dates against this. ONLY flag a date as future if it is strictly greater than this date.
4. BULLET REWRITES: Preserve factual content. Allowed: better action verbs, ordering. NOT allowed: invented metrics, tools, or responsibilities.
5. NO INFERRING UNSUPPORTED TECH: If a candidate has "React", do NOT assume "Next.js" or "TypeScript" unless explicitly stated.

Resume Text:
${resumeText}

Matching Results (Pre-calculated):
Score: ${deterministicResult.matchScore}/100
Missing Required Skills: ${deterministicResult.missingRequiredSkills.join(', ')}
Missing Preferred Skills: ${deterministicResult.missingPreferredSkills.join(', ')}

Return the response STRICTLY as a JSON object matching this exact schema:
{
  "resumeIssues": string[], // High level issues with formatting, missing sections, contact info, etc.
  "top5Changes": string[], // Top 5 actionable changes to improve ATS compatibility and skill alignment.
  "improvedBulletSuggestions": [
    {
      "original": string, // Extract an exact original bullet from the resume
      "improved": string, // Rewrite it better
      "reason": string // Explain why
    }
  ]
}

DO NOT include any markdown formatting like \`\`\`json in your response, just return the raw JSON string. Make sure all arrays have at least 1 item if applicable.
`;

    // 3. GEMINI CALL
    let aiResult;
    try {
      aiResult = await generateAiCompletion({ prompt, agentType: 'RESUME' });
    } catch (apiError: any) {
      if (apiError.code === 'AI_AUTH_ERROR' || apiError.status === 401 || apiError.status === 403) {
        res.status(401).json({
          success: false,
          stage: 'GEMINI_REQUEST',
          code: 'GEMINI_AUTH_ERROR',
          message: 'Gemini authentication/configuration is invalid.'
        });
        return;
      }
      
      console.warn('AI unavailable, falling back to deterministic analysis. Error:', apiError.message);
      
      // Return deterministic fallback
      sendSuccess(res, { message: 'Resume-JD analysis completed. AI-powered suggestions are temporarily unavailable.', data: deterministicResult });
      return;
    }
    
    // 4. PARSING & MERGE
    let parsedResponse;
    try {
      let cleanedText = aiResult.text.trim();
      cleanedText = cleanedText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleanedText);
      
      parsedResponse = {
        ...deterministicResult,
        resumeIssues: aiData.resumeIssues || [],
        top5Changes: aiData.top5Changes || deterministicResult.top5Changes,
        improvedBulletSuggestions: aiData.improvedBulletSuggestions || [],
        isDeterministicOnly: false,
        aiModelUsed: aiResult.model
      };
    } catch (parseError) {
      console.error('Gemini response parse failed', aiResult.text);
      
      // Return deterministic fallback on parse failure
      sendSuccess(res, { message: 'Resume-JD analysis completed. AI-powered suggestions are temporarily unavailable due to parsing error.', data: deterministicResult });
      return;
    }

    sendSuccess(res, { 
      message: parsedResponse.aiModelUsed !== process.env.AI_MODEL ? 'Analysis completed using an available AI model.' : 'Resume analyzed successfully.', 
      data: parsedResponse 
    });
  } catch (err) {
    next(err);
  }
}
