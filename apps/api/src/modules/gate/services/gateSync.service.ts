import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const calculateHash = (content: any) => {
    return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
};

export const fetchOfficialDataMock = async (url: string) => {
    // Simulates an HTTP request to an official source
    return { syllabusData: 'MOCK_PAYLOAD', updatedAt: new Date() };
};

export const syncExamData = async (examId: string, entityType: string, sourceUrl: string) => {
    // 1. Fetch official payload safely
    let payload;
    try {
        payload = await fetchOfficialDataMock(sourceUrl);
    } catch (err: any) {
        await prisma.gateSyncRecord.create({
            data: { examId, entityType, status: 'FAILED', details: err.message }
        });
        throw new Error(`Unable to verify current official information from ${sourceUrl}.`);
    }

    // 2. Hash payload to detect changes
    const currentHash = calculateHash(payload);

    // 3. Check last sync record 
    const lastSync = await prisma.gateSyncRecord.findFirst({
        where: { examId, entityType, status: 'SUCCESS' },
        orderBy: { lastSyncedAt: 'desc' }
    });

    const previousHash = lastSync?.details ? JSON.parse(lastSync.details).hash : null;

    if (currentHash === previousHash) {
        // No change detected
        return await prisma.gateSyncRecord.create({
            data: { examId, entityType, status: 'SUCCESS', details: JSON.stringify({ hash: currentHash, message: 'No changes detected' }) }
        });
    }

    // 4. Change detected, persist new version
    // In a real application, you'd increment version numbers on GateQuestions/Syllabus here
    const syncRecord = await prisma.gateSyncRecord.create({
        data: {
            examId,
            entityType,
            status: 'SUCCESS',
            details: JSON.stringify({
                hash: currentHash,
                message: 'Content changed, new version propagated',
                previousHash
            })
        }
    });

    return syncRecord;
};

export const getSyncStatus = async () => {
    return await prisma.gateSyncRecord.findMany({
        orderBy: { lastSyncedAt: 'desc' },
        include: { exam: true },
        take: 50
    });
};
