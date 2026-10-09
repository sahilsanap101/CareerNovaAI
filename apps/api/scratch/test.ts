import { generateAiCompletion } from '../src/modules/ai/gateway/aiGateway';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const prompt = `You are an expert IT career advisor. Provide the current Top 10 trending software/IT job roles.`;
    const result = await generateAiCompletion({ prompt });
    console.log("Success:", result);
  } catch (err: any) {
    console.error("Test failed:", err);
    if (err.message) {
      console.error(err.message);
    }
  }
}

test();
