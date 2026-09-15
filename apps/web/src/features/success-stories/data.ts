export interface SuccessStory {
    id: string;
    name: string;
    ghrceBackground: string;
    careerPath: string;
    currentRole?: string;
    organization: string;
    location?: string;
    linkedinUrl?: string;
    caption: string;
    imageUrl?: string;
}

export const successStories: SuccessStory[] = [
    {
        id: 'pradnil-rajankar',
        name: 'Pradnil Rajankar',
        ghrceBackground: 'CSE (GHRCE) 2014–16-era student involvement',
        careerPath: 'Software Engineering → MS → Amazon',
        currentRole: 'Software Development Engineer II',
        organization: 'Amazon Advertising',
        location: 'Seattle',
        linkedinUrl: 'https://www.linkedin.com/in/pradnilrajankar',
        caption: 'From GHRCE to Amazon Advertising',
    },
    {
        id: 'sarang-mandavgade',
        name: 'Sarang Mandavgade',
        ghrceBackground: 'B.E. Information Technology (GHRCE, 2012–2016)',
        careerPath: 'Software Engineering + Security',
        currentRole: 'Senior Software Engineer',
        organization: 'NTT DATA Intellilink',
        location: 'Tokyo, Japan',
        linkedinUrl: 'https://www.linkedin.com/in/sarangmandavgade',
        caption: 'From GHRCE Information Technology to Software Engineering & Security',
    },
    {
        id: 'dhanashree-borgaonkar',
        name: 'Dhanashree Borgaonkar',
        ghrceBackground: 'B.Tech CSE (GHRCE, 2019–2023)',
        careerPath: 'Testing / Automation → Analyst',
        currentRole: 'Analyst / Automation Analyst',
        organization: 'Accenture',
        location: 'Pune',
        linkedinUrl: 'https://in.linkedin.com/in/dhanashree-borgaonkar-756b961b2',
        caption: 'From Testing & Automation to Analytics',
    },
    {
        id: 'anshuman-kumar',
        name: 'Anshuman Kumar',
        ghrceBackground: 'GHRCE (2019–2023)',
        careerPath: 'Software Development',
        currentRole: 'Software Developer',
        organization: 'Amadeus Labs',
        linkedinUrl: 'https://in.linkedin.com/in/anshuman-kumar-6a7b191a1',
        caption: 'From GHRCE to Software Development',
    },
    {
        id: 'soumya-lokhande',
        name: 'Soumya Lokhande',
        ghrceBackground: 'GHRCE (2021–2024)',
        careerPath: 'Cloud → IT Engineering',
        currentRole: 'IT Application Engineer',
        organization: 'NVIDIA',
        location: 'Pune',
        linkedinUrl: 'https://in.linkedin.com/in/soumya-lokhande-064476220',
        caption: 'From Cloud & IT to NVIDIA',
    },
    {
        id: 'shriya-raut',
        name: 'Shriya Raut',
        ghrceBackground: 'B.Tech CSE / AI/ML-related background (2021–2025)',
        careerPath: 'AI/ML + Software Development',
        organization: 'IBM',
        location: 'Bengaluru',
        linkedinUrl: 'https://in.linkedin.com/in/shriya-raut',
        caption: 'From AI/ML at GHRCE to IBM',
    },
    {
        id: 'aaliya-ali',
        name: 'Aaliya Ali',
        ghrceBackground: 'CSE',
        careerPath: 'Software / Technology → Finance / Analytics',
        organization: 'JPMorgan Chase & Co.',
        linkedinUrl: 'https://in.linkedin.com/in/aaliyaali',
        caption: 'From Technology to Finance & Analytics',
    },
    {
        id: 'rushabh-gandhi',
        name: 'Rushabh Gandhi',
        ghrceBackground: 'Alumnus',
        careerPath: 'Software Engineering',
        currentRole: 'Senior Software Engineer',
        organization: 'Remitly',
        location: 'Greater Seattle Area',
        caption: 'From GHRCE to Senior Software Engineering',
    },
    {
        id: 'poorva-pantane',
        name: 'Poorva Pantane',
        ghrceBackground: 'B.E. Computer Technology (2000–2004)',
        careerPath: 'Technology Consulting → Supply Chain',
        currentRole: 'Supply Chain Consulting Practice Lead',
        organization: 'Tata Consultancy Services',
        location: 'Australia',
        linkedinUrl: 'https://au.linkedin.com/in/poorva-pantane-66a0a320',
        caption: 'From Computer Technology to Technology Consulting & Supply Chain Leadership',
    }
];
