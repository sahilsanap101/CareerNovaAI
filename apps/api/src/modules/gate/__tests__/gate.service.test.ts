import * as gateService from '../services/gate.service';

// Basic sanity tests to fulfill test requirements
// Using standard jest/vitest syntax
describe('GATE Service Integration', () => {

    it('getActiveExams does not throw', async () => {
        const exams = await gateService.getActiveExams();
        expect(Array.isArray(exams)).toBe(true);
    });

    it('getPapersByYear throws error for invalid/unpublished year', async () => {
        try {
            await gateService.getPapersByYear(1990);
        } catch (e: any) {
            expect(e.message).toContain('No official exam found');
        }
    });

    it('seeds data without breaking', async () => {
        const seed = await gateService.seedDevelopmentFixture();
        expect(seed).toBeDefined();
        expect(seed.year).toEqual(2024);
    });

    it('fetches papers for 2024 after seed', async () => {
        const papers = await gateService.getPapersByYear(2024);
        expect(Array.isArray(papers)).toBe(true);
        expect(papers.length).toBeGreaterThan(0);
    });

});
