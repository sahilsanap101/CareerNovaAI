import { logger } from '@/utils/logger';
import { GoogleGenAI } from '@google/genai';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';

export interface CompletionOptions {
  prompt: string;
  systemPrompt?: string;
  agentType?: string;
  userId?: string;
  temperature?: number;
}

export interface CompletionResult {
  text: string;
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  durationMs: number;
  sources?: string[];
}

/**
 * Provider-Independent AI Gateway
 * Connects natively to Google Gemini (or specified Provider).
 */
export async function generateAiCompletion(options: CompletionOptions): Promise<CompletionResult> {
  const startTime = Date.now();
  const provider = process.env.AI_PROVIDER || 'GEMINI';
  const model = process.env.AI_MODEL || 'gemini-1.5-pro';

  logger.info(`🤖 AI Gateway executing completion via provider: ${provider} [${model}]`);

  // Provider abstraction logic
  const responseText = await executeProviderCompletion(provider, model, options);
  const durationMs = Date.now() - startTime;

  const tokensInput = Math.round(options.prompt.length / 4);
  const tokensOutput = Math.round(responseText.length / 4);

  return {
    text: responseText,
    provider,
    model,
    tokensInput,
    tokensOutput,
    durationMs,
  };
}

async function executeProviderCompletion(provider: string, model: string, options: CompletionOptions): Promise<string> {
  const { prompt, systemPrompt } = options;

  if (provider === 'GEMINI') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AppError(
        'The AI provider is unavailable. Please check backend configuration.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVER_001
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: systemPrompt ? { systemInstruction: systemPrompt } : undefined,
      });

      return response.text || "No response generated.";
    } catch (err: any) {
      logger.error('Gemini API Error:', err);
      throw new AppError(
        'The AI provider failed to generate a response. Please try again later.',
        HTTP_STATUS.BAD_GATEWAY,
        ERROR_CODES.SERVER_001
      );
    }
  }

  throw new AppError(
    'Unsupported AI Provider configured.',
    HTTP_STATUS.NOT_IMPLEMENTED,
    ERROR_CODES.SERVER_001
  );
}
