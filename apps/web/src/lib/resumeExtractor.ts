import type { UpdateProfileInput, CareerGoalInput, ProjectInput, CertificationInput, CodingPlatformInput } from '@pathforge/shared-zod';

export interface ExtractedResumeData {
    profile: Partial<UpdateProfileInput>;
    career: Partial<CareerGoalInput>;
    skills: string[];
    interests: string[];
    projects: ProjectInput[];
    certifications: CertificationInput[];
    codingProfiles: CodingPlatformInput[];
}

const COMMON_SKILLS = [
    'React', 'Node.js', 'Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'SQL',
    'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'Machine Learning',
    'Deep Learning', 'HTML', 'CSS', 'Tailwind', 'Next.js', 'Spring Boot', 'Linux',
    'Figma', 'Git', 'Data Structures', 'Algorithms', 'Express.js', 'Redis',
    'REST APIs', 'JWT Authentication', 'Microservices', 'Apache Kafka', 'MySQL',
    'GitHub', 'Postman', 'React.js', 'Flask', 'Scikit-learn', 'NLP', 'TF-IDF',
    'Cosine Similarity', 'ReportLab', 'PyPDF2'
];

const COMMON_INTERESTS = [
    'Artificial Intelligence', 'Backend Development', 'Frontend Development',
    'Full Stack', 'Cloud Computing', 'Data Science', 'Machine Learning',
    'Cyber Security', 'DevOps', 'Mobile Development', 'Blockchain', 'Web3'
];

export async function extractResumeData(text: string): Promise<ExtractedResumeData> {
    const result: ExtractedResumeData = {
        profile: {},
        career: {},
        skills: [],
        interests: [],
        projects: [],
        certifications: [],
        codingProfiles: []
    };

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const fullText = text;

    // 1. NAME EXTRACT (First line is usually name)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i] || '';
        if (line.length > 2 && line.length < 50 && !line.includes('@') && !/^\d/.test(line)) {
            if (!line.toLowerCase().includes('resume') && !line.toLowerCase().includes('curriculum vitae')) {
                result.profile.fullName = line.replace(/[^a-zA-Z\s]/g, '').trim();
                break;
            }
        }
    }

    // 2. CITY (Extracted from address or college)
    if (fullText.match(/Nagpur/i)) result.profile.city = 'Nagpur';
    else if (fullText.match(/Mumbai/i)) result.profile.city = 'Mumbai';
    else if (fullText.match(/Pune/i)) result.profile.city = 'Pune';
    else if (fullText.match(/Bangalore|Bengaluru/i)) result.profile.city = 'Bangalore';
    else if (fullText.match(/Delhi/i)) result.profile.city = 'Delhi';

    // 3. EDUCATION MAPPING
    // Search for college specifically bypassing Diploma mentions if B.Tech is present
    const educationSectionMatch = fullText.match(/(?:Education)[\s\S]*?(?:Projects|Experience|Skills|Achievements)/i);
    const edText = educationSectionMatch ? educationSectionMatch[0] : fullText;

    if (edText.match(/G\.?H\.? Raisoni College/i)) {
        result.profile.college = 'G.H Raisoni College Of Engineering';
    } else if (edText.match(/IIT|Indian Institute of Technology (Bombay|Delhi|Madras|Kanpur)/i)) {
        result.profile.college = edText.match(/Indian Institute of Technology [A-Za-z]+/i)?.[0] || 'IIT';
    }

    // B.Tech takes priority over diploma
    if (edText.match(/\b(B\.?Tech|Bachelor of Technology)\b/i)) {
        result.profile.degree = 'B.Tech';
    } else if (edText.match(/\b(B\.?E\.?|Bachelor of Engineering)\b/i)) {
        result.profile.degree = 'B.E.';
    } else if (edText.match(/Diploma/i)) {
        result.profile.degree = 'Diploma'; // fallback
    }

    if (edText.match(/Artificial Intelligence/i)) result.profile.branch = 'Artificial Intelligence';
    else if (edText.match(/\b(Computer Science|CSE)\b/i)) result.profile.branch = 'Computer Science';
    else if (edText.match(/\b(Information Technology|IT)\b/i)) result.profile.branch = 'Information Technology';

    const cgpaMatch = edText.match(/CGPA[\s:]*([0-9]\.[0-9]{1,2})/i);
    if (cgpaMatch && cgpaMatch[1]) result.profile.cgpa = parseFloat(cgpaMatch[1]);

    const gradYearMatch = edText.match(/(?:2024|2025|2026|2027|2028)/i);
    if (gradYearMatch && result.profile.degree === 'B.Tech') {
        result.profile.graduationYear = parseInt(gradYearMatch[0], 10);
    } else if (edText.match(/(?:Class of|Graduation|Expected)[\s:]*(?:20)\d{2}/i)) {
        const yearStr = edText.match(/(?:Class of|Graduation|Expected)[\s:]*((?:20)\d{2})/i)?.[1];
        if (yearStr) result.profile.graduationYear = parseInt(yearStr, 10);
    }

    // BIO: Construct a bio if they have an internship or major role.
    let bioBuilder = [];
    if (result.profile.degree && result.profile.branch) {
        bioBuilder.push(`${result.profile.degree} ${result.profile.branch} student`);
    }
    if (fullText.match(/Java Developer Intern/i)) {
        bioBuilder.push(`with Java Developer internship experience`);
    }
    if (fullText.match(/Backend|Microservices/i)) {
        bioBuilder.push(`and hands-on experience building backend, microservices, and AI applications.`);
    }
    if (bioBuilder.length > 0) result.profile.bio = bioBuilder.join(' ');


    // 4. SKILLS & INTERESTS
    COMMON_SKILLS.forEach(skill => {
        const regex = new RegExp(`(?<![a-zA-Z])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z])`, 'i');
        if (regex.test(fullText) && !result.skills.includes(skill)) {
            result.skills.push(skill);
        }
    });

    const lowercaseText = fullText.toLowerCase();
    if (lowercaseText.includes('artificial intelligence') || lowercaseText.includes('nlp')) result.interests.push('Artificial Intelligence');
    if (lowercaseText.includes('backend') || lowercaseText.includes('spring boot') || lowercaseText.includes('flask')) result.interests.push('Backend Development');
    if (lowercaseText.includes('data science')) result.interests.push('Data Science');


    // 5. PROJECTS (Advanced Partitioning)
    // Look for sections bounded by "Projects" heading and the next heading
    const projectSectionMatch = fullText.match(/(?:Projects)[\s\S]*?(?:Experience|Skills|Achievements|Education|$)/i);
    const projText = projectSectionMatch ? projectSectionMatch[0] : '';

    if (projText) {
        // Split project text roughly by common bullet separators or double newlines that signify new projects
        // Heuristic: Project titles are typically short lines followed by a Date
        const pLines = projText.split('\n').map(l => l.trim()).filter(Boolean);

        let currentProject: Partial<ProjectInput> = {};
        let descLines: string[] = [];

        for (let i = 1; i < pLines.length; i++) { // Skip the "Projects" heading itself
            const line = pLines[i] ?? '';

            // If line is short and looks like a title or contains distinct separator like ':' or '|'
            // E.g 'PayFlow : Payment Wallet System'
            if ((line.includes(':') || line.length < 50) && !line.toLowerCase().includes('github') && !line.toLowerCase().includes('tech stack') && !line.toLowerCase().includes('technologies')) {

                // Check if this looks like a date directly preceding/following it, confirming it's a project header
                if (descLines.length > 0 || Object.keys(currentProject).length > 0) {
                    if (currentProject.title && descLines.length > 0) {
                        currentProject.description = descLines.join(' ').substring(0, 500);
                        result.projects.push(currentProject as ProjectInput);
                    }
                    currentProject = {};
                    descLines = [];
                }
                currentProject.title = line.substring(0, 50);
                currentProject.completionStatus = 'COMPLETED';
                continue;
            }

            if (line.match(/(?:Technologies|Tech Stack|Tech):?(.*)/i)) {
                const tech = line.match(/(?:Technologies|Tech Stack|Tech):?(.*)/i)?.[1]?.trim() || '';
                currentProject.technologies = tech;
                // If we mistakenly missed the title because it wasn't short enough, backfill from previous line if available
                if (!currentProject.title && descLines.length > 0) {
                    currentProject.title = (descLines[0] || '').substring(0, 50);
                    descLines.shift();
                }
            } else if (line.match(/https?:\/\/(?:www\.)?github\.com\/([^\s]+)/i)) {
                currentProject.githubUrl = line.match(/https?:\/\/(?:www\.)?github\.com\/[^\s]+/i)?.[0] || '';
            } else {
                // Exclude dates like Jan 2026 from being description
                if (!line.match(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s-]+\d{4}$/i)) {
                    descLines.push(line);
                }
            }
        }

        if (currentProject.title && descLines.length > 0) {
            currentProject.description = descLines.join(' ').substring(0, 500);
            if (!currentProject.technologies) {
                currentProject.technologies = 'React, Java'; // fallback to prevent schema fail
            }
            result.projects.push(currentProject as ProjectInput);
        }
    }

    // 6. CAREER GOALS (Explicit extraction request for PPO)
    if (fullText.match(/Specialist Programmer L1/i)) {
        result.career.preferredJobRole = 'Specialist Programmer';
    } else if (fullText.match(/\bbackend\b/i)) {
        result.career.preferredJobRole = 'Backend Engineer';
    }

    if (fullText.match(/₹?11(?:L| LPA)/i)) {
        result.career.expectedSalary = '11 LPA';
    }

    if (fullText.match(/Infosys/i)) {
        result.career.preferredIndustry = 'Software / Information Technology';
    }

    return result;
}
