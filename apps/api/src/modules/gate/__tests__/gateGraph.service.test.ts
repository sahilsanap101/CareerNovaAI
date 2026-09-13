import { PrismaClient } from '@prisma/client';
import * as gateGraphService from '../services/gateGraph.service';

const prisma = new PrismaClient();

describe('GATE Directed Knowledge Graph Engine', () => {

    it('detects no cycles in a linear valid graph', async () => {
        // We mock prisma.gateTopicPrerequisite.findMany in evaluating cyclical deps
        jest.spyOn(prisma.gateTopicPrerequisite, 'findMany').mockResolvedValue([
            { prereqTopicId: "A", targetTopicId: "B" } as any,
            { prereqTopicId: "B", targetTopicId: "C" } as any,
        ]);

        const result = await gateGraphService.detectCycles();
        expect(result.cyclic).toBe(false);
    });

    it('correctly detects a circular prerequisite failure', async () => {
        // A -> B -> C -> A
        jest.spyOn(prisma.gateTopicPrerequisite, 'findMany').mockResolvedValue([
            { prereqTopicId: "A", targetTopicId: "B" } as any,
            { prereqTopicId: "B", targetTopicId: "C" } as any,
            { prereqTopicId: "C", targetTopicId: "A" } as any,
        ]);

        const result = await gateGraphService.detectCycles();
        expect(result.cyclic).toBe(true);
        expect(result.failingNode).toBeDefined();
    });

    it('calculates accurate downstream impact length without cyclic loops', async () => {
        jest.spyOn(prisma.gateTopicPrerequisite, 'findMany').mockResolvedValue([
            { prereqTopicId: "A", targetTopicId: "B" } as any,
            { prereqTopicId: "B", targetTopicId: "C" } as any,
            { prereqTopicId: "B", targetTopicId: "D" } as any,
        ]);

        // A unlocks B, C, D (3 nodes downstream)
        const impactA = await gateGraphService.getDownstreamImpact("A");
        expect(impactA).toBe(3);

        // B unlocks C, D (2 nodes)
        const impactB = await gateGraphService.getDownstreamImpact("B");
        expect(impactB).toBe(2);

        // C unlocks nothing
        const impactC = await gateGraphService.getDownstreamImpact("C");
        expect(impactC).toBe(0);
    });
});
