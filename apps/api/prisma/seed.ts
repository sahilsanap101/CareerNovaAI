import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_SKILLS = [
  // Programming
  { name: 'C', category: 'Programming' },
  { name: 'C++', category: 'Programming' },
  { name: 'Java', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'JavaScript', category: 'Programming' },
  { name: 'TypeScript', category: 'Programming' },
  { name: 'Go', category: 'Programming' },
  { name: 'Rust', category: 'Programming' },

  // Frontend
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Vue', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Django', category: 'Backend' },

  // Database
  { name: 'MySQL', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },

  // Cloud & DevOps
  { name: 'AWS', category: 'Cloud' },
  { name: 'Azure', category: 'Cloud' },
  { name: 'GCP', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'GitHub Actions', category: 'DevOps' },

  // Cyber Security
  { name: 'Linux', category: 'Cyber Security' },
  { name: 'Networking', category: 'Cyber Security' },
  { name: 'Burp Suite', category: 'Cyber Security' },
  { name: 'Wireshark', category: 'Cyber Security' },
  { name: 'Metasploit', category: 'Cyber Security' },

  // AI & Data
  { name: 'Machine Learning', category: 'AI' },
  { name: 'TensorFlow', category: 'AI' },
  { name: 'PyTorch', category: 'AI' },
];

const DEFAULT_INTERESTS = [
  { name: 'Artificial Intelligence', category: 'AI' },
  { name: 'Cyber Security', category: 'Security' },
  { name: 'Backend Development', category: 'Engineering' },
  { name: 'Cloud Computing', category: 'Infrastructure' },
  { name: 'Data Science', category: 'Data' },
  { name: 'Mobile Development', category: 'Mobile' },
  { name: 'Blockchain', category: 'Emerging Tech' },
  { name: 'Game Development', category: 'Graphics' },
  { name: 'Research & Academia', category: 'Research' },
];

const CAREER_PATHS_DATA = [
  {
    name: 'Software Engineer',
    category: 'Software Engineering',
    description: 'Design, develop, and maintain core software applications, algorithms, and data structures.',
    averageSalary: '12 - 24 LPA',
    growthRate: '18% YoY',
    demandLevel: 'HIGH',
    icon: 'Code',
    color: 'blue',
    skills: [
      { name: 'Java', weight: 9 },
      { name: 'C++', weight: 8 },
      { name: 'Python', weight: 8 },
      { name: 'PostgreSQL', weight: 7 },
      { name: 'Linux', weight: 7 },
    ],
  },
  {
    name: 'Full Stack Developer',
    category: 'Software Engineering',
    description: 'Build end-to-end web applications combining responsive frontends with scalable REST/GraphQL APIs.',
    averageSalary: '14 - 28 LPA',
    growthRate: '24% YoY',
    demandLevel: 'VERY_HIGH',
    icon: 'Layers',
    color: 'purple',
    skills: [
      { name: 'React', weight: 10 },
      { name: 'TypeScript', weight: 9 },
      { name: 'Node.js', weight: 9 },
      { name: 'Express', weight: 8 },
      { name: 'PostgreSQL', weight: 8 },
      { name: 'HTML', weight: 7 },
      { name: 'CSS', weight: 7 },
    ],
  },
  {
    name: 'Backend Developer',
    category: 'Software Engineering',
    description: 'Specialize in server-side logic, database query optimization, microservices, and distributed architecture.',
    averageSalary: '14 - 30 LPA',
    growthRate: '22% YoY',
    demandLevel: 'VERY_HIGH',
    icon: 'Server',
    color: 'emerald',
    skills: [
      { name: 'Node.js', weight: 10 },
      { name: 'Express', weight: 9 },
      { name: 'PostgreSQL', weight: 9 },
      { name: 'Redis', weight: 8 },
      { name: 'Docker', weight: 8 },
      { name: 'Go', weight: 7 },
    ],
  },
  {
    name: 'Frontend Developer',
    category: 'Web Development',
    description: 'Craft intuitive, accessible user interfaces with dynamic state management and CSS animations.',
    averageSalary: '10 - 22 LPA',
    growthRate: '20% YoY',
    demandLevel: 'HIGH',
    icon: 'Layout',
    color: 'sky',
    skills: [
      { name: 'React', weight: 10 },
      { name: 'TypeScript', weight: 9 },
      { name: 'JavaScript', weight: 9 },
      { name: 'HTML', weight: 8 },
      { name: 'CSS', weight: 8 },
    ],
  },
  {
    name: 'Mobile Developer',
    category: 'Mobile Engineering',
    description: 'Architect native and cross-platform mobile apps for iOS and Android devices.',
    averageSalary: '12 - 25 LPA',
    growthRate: '19% YoY',
    demandLevel: 'HIGH',
    icon: 'Smartphone',
    color: 'indigo',
    skills: [
      { name: 'TypeScript', weight: 9 },
      { name: 'React', weight: 9 },
      { name: 'JavaScript', weight: 8 },
    ],
  },
  {
    name: 'DevOps Engineer',
    category: 'Cloud & DevOps',
    description: 'Automate CI/CD pipelines, container orchestration, infrastructure as code, and continuous deployment.',
    averageSalary: '16 - 32 LPA',
    growthRate: '28% YoY',
    demandLevel: 'EXTREME',
    icon: 'Terminal',
    color: 'amber',
    skills: [
      { name: 'Docker', weight: 10 },
      { name: 'Kubernetes', weight: 10 },
      { name: 'Linux', weight: 9 },
      { name: 'GitHub Actions', weight: 9 },
      { name: 'AWS', weight: 8 },
    ],
  },
  {
    name: 'Cloud Engineer',
    category: 'Cloud & DevOps',
    description: 'Design and deploy multi-cloud infrastructure, serverless architectures, and cloud security policies.',
    averageSalary: '15 - 30 LPA',
    growthRate: '26% YoY',
    demandLevel: 'EXTREME',
    icon: 'Cloud',
    color: 'cyan',
    skills: [
      { name: 'AWS', weight: 10 },
      { name: 'Azure', weight: 9 },
      { name: 'GCP', weight: 8 },
      { name: 'Linux', weight: 8 },
      { name: 'Docker', weight: 8 },
    ],
  },
  {
    name: 'Cyber Security Analyst',
    category: 'Cyber Security',
    description: 'Protect organizational networks, identify vulnerabilities, and respond to cyber security incidents.',
    averageSalary: '12 - 26 LPA',
    growthRate: '25% YoY',
    demandLevel: 'VERY_HIGH',
    icon: 'Shield',
    color: 'red',
    skills: [
      { name: 'Linux', weight: 10 },
      { name: 'Networking', weight: 10 },
      { name: 'Wireshark', weight: 9 },
      { name: 'Python', weight: 8 },
    ],
  },
  {
    name: 'SOC Analyst',
    category: 'Cyber Security',
    description: 'Monitor Security Operations Center SIEM dashboards 24/7 to detect threat vectors and suspicious telemetry.',
    averageSalary: '10 - 20 LPA',
    growthRate: '21% YoY',
    demandLevel: 'HIGH',
    icon: 'Activity',
    color: 'orange',
    skills: [
      { name: 'Networking', weight: 10 },
      { name: 'Wireshark', weight: 9 },
      { name: 'Linux', weight: 9 },
    ],
  },
  {
    name: 'Penetration Tester',
    category: 'Cyber Security',
    description: 'Perform ethical hacking assessments, web application penetration tests, and vulnerability disclosures.',
    averageSalary: '15 - 28 LPA',
    growthRate: '27% YoY',
    demandLevel: 'EXTREME',
    icon: 'Lock',
    color: 'rose',
    skills: [
      { name: 'Burp Suite', weight: 10 },
      { name: 'Metasploit', weight: 10 },
      { name: 'Linux', weight: 9 },
      { name: 'Python', weight: 8 },
      { name: 'Networking', weight: 8 },
    ],
  },
  {
    name: 'Security Engineer',
    category: 'Cyber Security',
    description: 'Build cryptographic controls, secure authentication systems, and zero-trust enterprise security pipelines.',
    averageSalary: '18 - 35 LPA',
    growthRate: '26% YoY',
    demandLevel: 'EXTREME',
    icon: 'Key',
    color: 'red',
    skills: [
      { name: 'Linux', weight: 10 },
      { name: 'Networking', weight: 9 },
      { name: 'Python', weight: 9 },
      { name: 'Docker', weight: 8 },
    ],
  },
  {
    name: 'AI Engineer',
    category: 'AI & Data',
    description: 'Deploy deep learning models, LLM fine-tuning pipelines, and neural network architectures into production.',
    averageSalary: '18 - 38 LPA',
    growthRate: '35% YoY',
    demandLevel: 'EXTREME',
    icon: 'Cpu',
    color: 'violet',
    skills: [
      { name: 'Python', weight: 10 },
      { name: 'Machine Learning', weight: 10 },
      { name: 'PyTorch', weight: 9 },
      { name: 'TensorFlow', weight: 9 },
    ],
  },
  {
    name: 'Machine Learning Engineer',
    category: 'AI & Data',
    description: 'Train predictive models, design feature engineering pipelines, and optimize ML model inference speed.',
    averageSalary: '16 - 32 LPA',
    growthRate: '30% YoY',
    demandLevel: 'VERY_HIGH',
    icon: 'Brain',
    color: 'purple',
    skills: [
      { name: 'Python', weight: 10 },
      { name: 'Machine Learning', weight: 10 },
      { name: 'TensorFlow', weight: 9 },
      { name: 'PostgreSQL', weight: 7 },
    ],
  },
  {
    name: 'Data Scientist',
    category: 'AI & Data',
    description: 'Extract statistical insights, conduct hypothesis testing, and build data visualization models for business value.',
    averageSalary: '14 - 28 LPA',
    growthRate: '22% YoY',
    demandLevel: 'HIGH',
    icon: 'PieChart',
    color: 'indigo',
    skills: [
      { name: 'Python', weight: 10 },
      { name: 'Machine Learning', weight: 9 },
      { name: 'PostgreSQL', weight: 8 },
    ],
  },
  {
    name: 'Data Engineer',
    category: 'AI & Data',
    description: 'Architect high-throughput ETL data pipelines, data warehouses, and streaming analytics platforms.',
    averageSalary: '15 - 30 LPA',
    growthRate: '24% YoY',
    demandLevel: 'VERY_HIGH',
    icon: 'Database',
    color: 'teal',
    skills: [
      { name: 'Python', weight: 10 },
      { name: 'PostgreSQL', weight: 10 },
      { name: 'MongoDB', weight: 8 },
      { name: 'Docker', weight: 8 },
    ],
  },
  {
    name: 'Blockchain Developer',
    category: 'Emerging Tech',
    description: 'Develop decentralized applications (dApps), smart contracts, and Web3 protocol consensus algorithms.',
    averageSalary: '16 - 35 LPA',
    growthRate: '20% YoY',
    demandLevel: 'HIGH',
    icon: 'Link',
    color: 'amber',
    skills: [
      { name: 'Go', weight: 9 },
      { name: 'Rust', weight: 9 },
      { name: 'TypeScript', weight: 8 },
    ],
  },
  {
    name: 'IoT Engineer',
    category: 'Hardware & Systems',
    description: 'Build connected sensor networks, edge computing protocols, and embedded firmware applications.',
    averageSalary: '10 - 22 LPA',
    growthRate: '15% YoY',
    demandLevel: 'MODERATE',
    icon: 'Radio',
    color: 'emerald',
    skills: [
      { name: 'C', weight: 10 },
      { name: 'C++', weight: 9 },
      { name: 'Python', weight: 8 },
    ],
  },
  {
    name: 'Embedded Engineer',
    category: 'Hardware & Systems',
    description: 'Program microcontrollers, real-time operating systems (RTOS), and hardware drivers for IoT devices.',
    averageSalary: '11 - 24 LPA',
    growthRate: '16% YoY',
    demandLevel: 'MODERATE',
    icon: 'Cpu',
    color: 'slate',
    skills: [
      { name: 'C', weight: 10 },
      { name: 'C++', weight: 10 },
      { name: 'Linux', weight: 8 },
    ],
  },
  {
    name: 'QA Engineer',
    category: 'Software Engineering',
    description: 'Design automated testing frameworks, end-to-end regression suites, and load testing harnesses.',
    averageSalary: '9 - 18 LPA',
    growthRate: '14% YoY',
    demandLevel: 'MODERATE',
    icon: 'CheckSquare',
    color: 'green',
    skills: [
      { name: 'Python', weight: 9 },
      { name: 'JavaScript', weight: 9 },
      { name: 'GitHub Actions', weight: 8 },
    ],
  },
  {
    name: 'Site Reliability Engineer',
    category: 'Cloud & DevOps',
    description: 'Ensure 99.99% system availability, manage error budgets, incident response, and performance monitoring.',
    averageSalary: '18 - 36 LPA',
    growthRate: '29% YoY',
    demandLevel: 'EXTREME',
    icon: 'Activity',
    color: 'blue',
    skills: [
      { name: 'Linux', weight: 10 },
      { name: 'Kubernetes', weight: 10 },
      { name: 'Docker', weight: 9 },
      { name: 'Go', weight: 8 },
      { name: 'Python', weight: 8 },
    ],
  },
  {
    name: 'Product Manager',
    category: 'Product & Design',
    description: 'Bridge engineering, design, and business goals to deliver user-centric software products.',
    averageSalary: '16 - 32 LPA',
    growthRate: '20% YoY',
    demandLevel: 'HIGH',
    icon: 'Briefcase',
    color: 'indigo',
    skills: [
      { name: 'Python', weight: 6 },
      { name: 'SQL', weight: 6 },
    ],
  },
  {
    name: 'UI/UX Designer',
    category: 'Product & Design',
    description: 'Design user journeys, high-fidelity wireframes, interactive prototypes, and design systems.',
    averageSalary: '10 - 22 LPA',
    growthRate: '18% YoY',
    demandLevel: 'HIGH',
    icon: 'Figma',
    color: 'pink',
    skills: [
      { name: 'HTML', weight: 8 },
      { name: 'CSS', weight: 8 },
    ],
  },
  {
    name: 'Research Engineer',
    category: 'Research & Academia',
    description: 'Conduct foundational R&D in computer science, publish peer-reviewed papers, and create novel algorithms.',
    averageSalary: '18 - 40 LPA',
    growthRate: '22% YoY',
    demandLevel: 'HIGH',
    icon: 'BookOpen',
    color: 'violet',
    skills: [
      { name: 'Python', weight: 10 },
      { name: 'C++', weight: 9 },
      { name: 'Machine Learning', weight: 9 },
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding Phase 3 database...');

  // 1. Seed Master Skills
  const createdSkillsMap = new Map<string, string>();
  for (const s of DEFAULT_SKILLS) {
    const dbSkill = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: s,
    });
    createdSkillsMap.set(dbSkill.name, dbSkill.id);
  }

  // 2. Seed Master Interests
  for (const i of DEFAULT_INTERESTS) {
    await prisma.interest.upsert({
      where: { name: i.name },
      update: { category: i.category },
      create: i,
    });
  }

  // 3. Seed 23 Career Paths & Required Skills
  for (const cp of CAREER_PATHS_DATA) {
    const careerPath = await prisma.careerPath.upsert({
      where: { name: cp.name },
      update: {
        description: cp.description,
        category: cp.category,
        averageSalary: cp.averageSalary,
        growthRate: cp.growthRate,
        demandLevel: cp.demandLevel,
        icon: cp.icon,
        color: cp.color,
      },
      create: {
        name: cp.name,
        description: cp.description,
        category: cp.category,
        averageSalary: cp.averageSalary,
        growthRate: cp.growthRate,
        demandLevel: cp.demandLevel,
        icon: cp.icon,
        color: cp.color,
      },
    });

    // Upsert required skills
    for (const reqSkill of cp.skills) {
      const skillId = createdSkillsMap.get(reqSkill.name);
      if (skillId) {
        await prisma.requiredSkill.upsert({
          where: {
            careerPathId_skillId: {
              careerPathId: careerPath.id,
              skillId,
            },
          },
          update: { importanceWeight: reqSkill.weight },
          create: {
            careerPathId: careerPath.id,
            skillId,
            importanceWeight: reqSkill.weight,
          },
        });
      }
    }
  }

  // 4. Create admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pathforge.dev' },
    update: {},
    create: {
      fullName: 'PathForge Admin',
      email: 'admin@pathforge.dev',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      profile: { create: {} },
      preferences: { create: {} },
    },
  });

  // 5. Create sample student
  const studentPassword = await bcrypt.hash('Student@1234', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@pathforge.dev' },
    update: {},
    create: {
      fullName: 'Arjun Sharma',
      email: 'student@pathforge.dev',
      password: studentPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          college: 'IIT Bombay',
          university: 'IIT Bombay',
          branch: 'Computer Science',
          degree: 'B.Tech',
          specialization: 'Artificial Intelligence',
          currentYear: 3,
          currentSemester: 6,
          graduationYear: 2026,
          cgpa: 8.5,
          bio: 'Passionate about AI and distributed systems.',
          city: 'Mumbai',
          country: 'India',
        },
      },
      preferences: { create: {} },
      careerGoal: {
        create: {
          preferredJobRole: 'Software Development Engineer',
          preferredIndustry: 'Technology',
          preferredWorkMode: 'HYBRID',
          preferredCountries: 'India, USA',
          expectedSalary: '15-25 LPA',
          startup: true,
          research: true,
        },
      },
    },
  });

  console.log(`✅ Seeded ${CAREER_PATHS_DATA.length} Career Paths & Required Skills`);
  console.log('✅ Seeded users:', { admin: admin.email, student: student.email });
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
