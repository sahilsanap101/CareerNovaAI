import { buildAdaptiveRoadmapTree } from './adaptiveRoadmapEngine';
import * as fs from 'fs';

// Mock dependencies safely if they block local jest running without compiled graph
jest.mock('./skillDependencyEngine', () => ({
    getPrerequisiteChain: jest.fn((skills) => {
        // Return explicit mocks based on what is tested
        if (skills.includes('JavaScript')) return ['HTML', 'CSS', 'JavaScript'];
        if (skills.includes('Python')) return ['Python'];
        if (skills.includes('Bash')) return ['Bash']; // specific unknown
        if (skills.includes('JS')) return ['JavaScript']; // test alias
        if (skills.includes('javascript')) return ['JavaScript']; // test lowercase
        return skills;
    })
}));

describe('Adaptive Roadmap Engine - Curated Resource Loading', () => {

    test('1. known skill returns resource (JavaScript)', () => {
        const roadmap = buildAdaptiveRoadmapTree('Frontend', ['JavaScript'], []);
        const jsPhase = roadmap.find(p => p.modules.some(m => m.providedSkills.includes('JavaScript')));
        const mod = jsPhase?.modules.find(m => m.providedSkills.includes('JavaScript'));
        const res = mod?.tasks[0].resources as any[];

        expect(res).toBeDefined();
        expect(res).not.toEqual('resource_curation_pending');
        expect(res[0].title).toContain('MDN');
    });

    test('2. lowercase skill resolves correctly', () => {
        const roadmap = buildAdaptiveRoadmapTree('Frontend', ['javascript'], []);
        const mod = roadmap[0].modules.find(m => m.providedSkills.includes('JavaScript'));
        const res = mod?.tasks[0].resources as any[];

        expect(res).toBeDefined();
        expect(res).not.toEqual('resource_curation_pending');
        expect(res[0].url).toContain('developer.mozilla.org');
    });

    test('3. aliases resolve properly (JS -> JavaScript)', () => {
        const roadmap = buildAdaptiveRoadmapTree('Frontend', ['JS'], []);
        const mod = roadmap[0].modules.find(m => m.providedSkills.includes('JavaScript'));
        const res = mod?.tasks[0].resources as any[];

        expect(res).not.toEqual('resource_curation_pending');
        expect(res.length).toBeGreaterThan(0);
    });

    test('4. unknown skill returns resource_curation_pending string', () => {
        const roadmap = buildAdaptiveRoadmapTree('DevOps', ['Bash'], []);
        const mod = roadmap[0].modules.find(m => m.providedSkills.includes('Bash'));
        const res = mod?.tasks[0].resources;

        expect(res).toEqual('resource_curation_pending');
    });

    test('5. no dummy URL is generated in the output (Check string)', () => {
        const roadmap = buildAdaptiveRoadmapTree('Frontend', ['JavaScript'], []);
        const str = JSON.stringify(roadmap);
        expect(str.toLowerCase()).not.toContain('youtube.com/results');
        expect(str.toLowerCase()).not.toContain('search_query');
    });

    test('6. roadmap JSON phase shape remains valid without side-effect errors', () => {
        const roadmap = buildAdaptiveRoadmapTree('Frontend', ['JavaScript'], []);
        expect(roadmap.length).toBeGreaterThan(0);
        expect(roadmap[0].phaseNumber).toBe(1);
        expect(roadmap[0].modules).toBeDefined();
        expect(roadmap[0].modules[0].tasks.length).toBeGreaterThan(0);
    });

});
