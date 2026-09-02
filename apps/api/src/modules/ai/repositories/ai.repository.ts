import { prisma } from '@/config/database';

export async function createConversation(userId: string, title: string, agentType: string) {
  return prisma.conversation.create({
    data: {
      userId,
      title,
      agentType,
    },
  });
}

export async function getUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function saveMessage(conversationId: string, role: string, content: string, sources?: unknown, tokensUsed = 0) {
  const msg = await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      sources: sources as import('@prisma/client').Prisma.InputJsonValue,
      tokensUsed,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return msg;
}

export async function logAiMetric(data: {
  userId: string;
  agentType: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  durationMs: number;
}) {
  return prisma.aiMetric.create({
    data: {
      userId: data.userId,
      agentType: data.agentType,
      model: data.model,
      tokensInput: data.tokensInput,
      tokensOutput: data.tokensOutput,
      durationMs: data.durationMs,
      cost: (data.tokensInput + data.tokensOutput) * 0.000002,
    },
  });
}

export async function getAiAnalytics(userId: string) {
  const metrics = await prisma.aiMetric.findMany({
    where: { userId },
  });

  const totalTokens = metrics.reduce((a, b) => a + b.tokensInput + b.tokensOutput, 0);
  const totalCost = metrics.reduce((a, b) => a + b.cost, 0);
  const avgLatency = metrics.length > 0 ? metrics.reduce((a, b) => a + b.durationMs, 0) / metrics.length : 0;

  return {
    totalRequests: metrics.length,
    totalTokens,
    totalCost: Number(totalCost.toFixed(4)),
    avgLatencyMs: Math.round(avgLatency),
  };
}
