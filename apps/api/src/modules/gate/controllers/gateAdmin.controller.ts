// @ts-nocheck
import { Request, Response } from 'express';
import * as gateAdminService from '../services/gateAdmin.service';
import { GateExamLifecycle } from '@prisma/client';

export const handleError = (res: Response, error: any, status = 500) => {
    console.error('[GATE Admin API Error]:', error);
    res.status(status).json({ success: false, error: error.message || 'Internal Server Error' });
};

// Middleware equivalent explicitly rejecting non-admin attempts inside handlers
const checkAdmin = (req: Request) => {
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') throw new Error('FORBIDDEN_RESTRICTION: Admin boundaries violated.');
};

export const transitionLifecycle = async (req: Request, res: Response) => {
    try {
        checkAdmin(req);

        const year = parseInt(req.params.year as string, 10);
        const { nextStage } = req.body;
        const adminId = (req as any).user.id;

        const stageEnum = nextStage as GateExamLifecycle;

        const result = await gateAdminService.transitionExamLifecycle(year, stageEnum, adminId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        handleError(res, error, error.message?.includes('FORBIDDEN_RESTRICTION') ? 403 : 500);
    }
};

export const verifyResourceAccess = async (req: Request, res: Response) => {
    try {
        checkAdmin(req);

        const { resourceId } = req.params;
        const { isOfficial } = req.body;
        const adminId = (req as any).user.id;

        const result = await gateAdminService.verifyResource(resourceId as string, adminId, isOfficial);
        res.json({ success: true, data: result });
    } catch (error: any) {
        handleError(res, error, error.message?.includes('FORBIDDEN_RESTRICTION') ? 403 : 500);
    }
};
