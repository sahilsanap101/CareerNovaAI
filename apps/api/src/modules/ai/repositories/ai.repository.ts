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


