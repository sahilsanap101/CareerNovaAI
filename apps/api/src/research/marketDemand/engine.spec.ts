import {
    calculateFrequency,
    normalizeFrequencies,
    calculateMarketShare,
    calculateTemporalTrend,
    SimpleJobPosting,
    ProvenanceMetadata
} from './engine';

const MOCK_PROVENANCE: ProvenanceMetadata = {
    sourceDataset: 'MOCK_TEST_SET',
    dateRange: { start: '2025-01-01', end: '2025-03-01' },
    geography: 'GLOBAL',
    processingVersion: '1.0'
};

const FIXTURES: SimpleJobPosting[] = [
    { id: '1', careerId: 'c1', skillsExtracted: ['s1', 's2'] },
    { id: '2', careerId: 'c1', skillsExtracted: ['s1'] },
    { id: '3', careerId: 'c2', skillsExtracted: ['s2', 's3'] },
    { id: '4', careerId: 'c2', skillsExtracted: ['s3'] },
];

describe('Market Demand Engine', () => {

    describe('calculateFrequency', () => {
        it('calculates global frequency with bounds', () => {
            // s1 appears in 2 of 4 postings (0.5 freq)
            const res = calculateFrequency(FIXTURES, 's1', MOCK_PROVENANCE);
            expect(res.value).toBe(0.5);
            expect(res.sampleSize).toBe(4);
            // Wilson score bound for small N should be strictly less than empirical p
            expect(res.confidenceLowerBound).toBeLessThan(0.5);
            expect(res.confidenceLowerBound).toBeGreaterThan(0);
        });

        it('calculates career-specific frequency', () => {
            const careerC1Postings = FIXTURES.filter(f => f.careerId === 'c1');
            // s1 appears in 2 of 2 postings for c1 (1.0 freq)
            const res = calculateFrequency(careerC1Postings, 's1', MOCK_PROVENANCE, 'c1');
            expect(res.value).toBe(1.0);
            expect(res.sampleSize).toBe(2);
            expect(res.confidenceLowerBound).toBeLessThan(1.0);
        });
    });

    describe('normalizeFrequencies', () => {
        it('normalizes min-max within [0,1]', () => {
            const mapped = normalizeFrequencies([
                { skillId: 's1', value: 0.1, sampleSize: 10, provenance: MOCK_PROVENANCE },
                { skillId: 's2', value: 0.5, sampleSize: 10, provenance: MOCK_PROVENANCE },
                { skillId: 's3', value: 0.9, sampleSize: 10, provenance: MOCK_PROVENANCE },
            ]);
            expect(mapped[0].value).toBe(0); // lowest becomes 0
            expect(mapped[2].value).toBe(1); // highest becomes 1
            expect(mapped[1].value).toBe(0.5); // strictly linear middle
        });

        it('defaults to 0.5 for identical values', () => {
            const mapped = normalizeFrequencies([
                { skillId: 's1', value: 0.4, sampleSize: 10, provenance: MOCK_PROVENANCE },
                { skillId: 's2', value: 0.4, sampleSize: 10, provenance: MOCK_PROVENANCE },
            ]);
            expect(mapped[0].value).toBe(0.5);
        });
    });

    describe('calculateMarketShare', () => {
        it('calculates strict domain ratio', () => {
            // s2 appears globally 2 times, but only 1 time in c1
            const res = calculateMarketShare(1, 2, 's2', 'c1', MOCK_PROVENANCE);
            expect(res.value).toBe(0.5);
            expect(res.sampleSize).toBe(2);
        });
    });

    describe('calculateTemporalTrend', () => {
        it('calculates growth correctly', () => {
            const res = calculateTemporalTrend(0.2, 0.4, 's1', 'c1', MOCK_PROVENANCE);
            // from 0.2 to 0.4 is a 100% growth (+1.0)
            expect(Math.round(res.value)).toBe(1);
        });

        it('handles zero base gracefully via epsilon rounding', () => {
            const res = calculateTemporalTrend(0, 0.5, 's1', 'c1', MOCK_PROVENANCE);
            expect(res.value).toBeGreaterThan(0.5); // bounded safely
        });
    });

});
