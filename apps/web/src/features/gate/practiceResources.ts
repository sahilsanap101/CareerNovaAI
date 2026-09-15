export type ResourceCategory = 'Official' | 'Mock Tests' | 'Practice';

export interface GateResource {
    id: string;
    title: string;
    category: ResourceCategory;
    sourceType: 'Official GATE' | 'External Resource';
    url: string;
    description: string;
    year?: number;
}

export const GATE_RESOURCES: GateResource[] = [
    {
        id: 'official-2027',
        title: 'Official GATE Exam Papers & Syllabus',
        category: 'Official',
        sourceType: 'Official GATE',
        year: 2027,
        url: 'https://gate2027.iitm.ac.in/exam_papers_and_syllabus',
        description: 'Access official GATE test papers and syllabus information.'
    },
    {
        id: 'official-2026-downloads',
        title: 'Official GATE Downloads',
        category: 'Official',
        sourceType: 'Official GATE',
        year: 2026,
        url: 'https://gate2026.iitg.ac.in/download.html',
        description: 'Official GATE downloads, including previous-year examination resources.'
    },
    {
        id: 'official-2026-keys',
        title: 'Official Question Papers & Answer Keys',
        category: 'Official',
        sourceType: 'Official GATE',
        year: 2026,
        url: 'https://gate2026.iitg.ac.in/QPs-answer-keys.html',
        description: 'Access official question papers and answer-key resources.'
    },
    {
        id: 'testbook-mock',
        title: 'Testbook GATE Mock Tests',
        category: 'Mock Tests',
        sourceType: 'External Resource',
        url: 'https://testbook.com/gate/mock-test',
        description: 'Practice GATE-style mock tests and online questions.'
    },
    {
        id: 'gfg-practice',
        title: 'GeeksforGeeks GATE Practice / Mock Tests',
        category: 'Practice',
        sourceType: 'External Resource',
        url: 'https://www.geeksforgeeks.org/gate/gate-cse-mock-test-2025-online/',
        description: 'Practice GATE CSE questions and mock tests.'
    },
    {
        id: 'unacademy-test-series',
        title: 'Unacademy GATE Test Series',
        category: 'Mock Tests',
        sourceType: 'External Resource',
        url: 'https://unacademy.com/test-series/full-length-cs-it-gate-2026-test-series-by-unacademy/EDZLKCXA',
        description: 'Practice through structured GATE test-series resources.'
    }
];
