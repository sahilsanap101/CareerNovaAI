import { logger } from '@/utils/logger';
import { GoogleGenAI } from '@google/genai';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';
import dotenv from 'dotenv';

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
  // Ensure env is reloaded just in case
  dotenv.config();

  const provider = process.env.AI_PROVIDER || 'GEMINI';
  const model = process.env.AI_MODEL || 'gemini-3.5-flash';

  logger.info(`[AI_GATEWAY] Request started: Provider=${provider}, Model=${model}`);

  // Provider abstraction logic
  let responseText = '';
  let finalModelUsed = model;
  try {
    const result = await executeProviderCompletion(provider, model, options);
    responseText = result.text;
    finalModelUsed = result.finalModel;
    logger.info(`[AI_GATEWAY] Request completed: Provider=${provider}, Model=${finalModelUsed}, Duration=${Date.now() - startTime}ms`);
  } catch (error: any) {
    logger.error(`[AI_GATEWAY] Request failed: Provider=${provider}, Model=${model}, Duration=${Date.now() - startTime}ms`);
    throw error;
  }
  const durationMs = Date.now() - startTime;

  const tokensInput = Math.round(options.prompt.length / 4);
  const tokensOutput = Math.round(responseText.length / 4);

  return {
    text: responseText,
    provider,
    model: finalModelUsed,
    tokensInput,
    tokensOutput,
    durationMs,
  };
}

async function executeWithRetry(
  ai: GoogleGenAI,
  modelName: string,
  prompt: string,
  systemPrompt?: string,
  maxRetries = 3
): Promise<string> {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        // Exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.random() * 500;
        const delay = baseDelay + jitter;
        logger.info(`[AI_GATEWAY] Retrying model ${modelName}, attempt ${attempt}, waiting ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 120_000)
      );
      
      const genPromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: systemPrompt ? { systemInstruction: systemPrompt } : undefined,
      });

      const response = await Promise.race([genPromise, timeoutPromise]) as any;
      return response.text || "No response generated.";

    } catch (err: any) {
      const status = err.status || err.response?.status;
      
      // Retryable errors: 503 (Unavailable), 429 (Rate Limit), 502/504
      const isRetryable = status === 503 || status === 429 || status === 502 || status === 504 || err.message === 'AI_TIMEOUT';
      
      if (isRetryable && attempt < maxRetries) {
        logger.warn(`[AI_GATEWAY] Model ${modelName} encountered retryable error (Status: ${status || 'TIMEOUT'}). Retrying...`);
        attempt++;
        continue;
      }
      
      // If not retryable or max retries reached, throw the error
      logger.error(`[AI_GATEWAY] Model ${modelName} failed after ${attempt} attempts. Status: ${status}. Message: ${err.message}`);
      throw err;
    }
  }
  throw new Error('Max retries exceeded'); // Should not be reached
}

async function executeProviderCompletion(provider: string, primaryModel: string, options: CompletionOptions): Promise<{text: string, finalModel: string}> {
  const { prompt, systemPrompt } = options;

  if (provider === 'GEMINI') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      logger.error('[AI_GATEWAY] Gemini API key is missing from backend configuration.');
      throw new AppError(
        'Gemini API key is missing from backend configuration.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVER_001
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const fallbackModel = process.env.FALLBACK_GEMINI_MODEL || 'gemini-1.5-flash';

    try {
      logger.info(`[AI_GATEWAY] Attempting primary model: ${primaryModel}`);
      const text = await executeWithRetry(ai, primaryModel, prompt, systemPrompt, 3);
      return { text, finalModel: primaryModel };
    } catch (primaryErr: any) {
      const status = primaryErr.status || primaryErr.response?.status;
      
      // Authentication errors should NOT trigger fallback/retries, they should fail fast
      if (status === 401 || status === 403) {
        throw new AppError('Gemini authentication/configuration is invalid.', 401, 'AI_AUTH_ERROR');
      }

      logger.warn(`[AI_GATEWAY] Primary model ${primaryModel} failed. Attempting fallback model: ${fallbackModel}`);
      
      try {
        const text = await executeWithRetry(ai, fallbackModel, prompt, systemPrompt, 2);
        logger.info(`[AI_GATEWAY] Fallback model ${fallbackModel} succeeded.`);
        return { text, finalModel: fallbackModel };
      } catch (fallbackErr: any) {
        logger.error(`[AI_GATEWAY] Fallback model ${fallbackModel} also failed.`);
        
        // At this point both models have failed completely. Throw an AppError so the controller knows AI is unavailable
        throw new AppError('AI provider is currently unavailable.', 503, 'AI_UNAVAILABLE');
      }
    }
  }

  throw new AppError(
    'Unsupported AI Provider configured.',
    501,
    ERROR_CODES.SERVER_001
  );
}
