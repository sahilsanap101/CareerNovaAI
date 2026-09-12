import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { sendSuccess } from '@/utils/response';

export async function getPlatformStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const [
            registeredUsers,
            recommendationsGenerated,
            careerPaths,
            skillsModeled,
            roadmapsGenerated
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.recommendationResult.count(),
            prisma.careerPath.count(),
            prisma.skill.count(),
            prisma.roadmap.count()
        ]);

        sendSuccess(res, {
            message: 'Platform statistics retrieved successfully.',
            data: {
                registeredUsers,
                recommendationsGenerated,
                careerPaths,
                skillsModeled,
                roadmapsGenerated
            }
        });
    } catch (error) {
        next(error);
    }
}

