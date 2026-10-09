export const assessmentData = [
  {
    section: "SECTION A — WORK AND ROLE PREFERENCE",
    question: "Q1:\nWhat type of software work sounds most interesting to you?",
    order: 1,
    options: [
      { label: "Building user interfaces and user experiences", value: "Q1_O1", careerWeights: { "Frontend Developer": 1.0, "UI/UX Designer": 1.0, "Web Developer": 0.8 } },
      { label: "Building backend systems and APIs", value: "Q1_O2", careerWeights: { "Backend Developer": 1.0, "Java Developer": 0.8, "Python Developer": 0.8 } },
      { label: "Building complete applications from frontend to backend", value: "Q1_O3", careerWeights: { "Full Stack Developer": 1.0, "Software Engineer": 0.8, "Software Developer": 0.8 } },
      { label: "Working with data and analytics", value: "Q1_O4", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 0.9, "Data Engineer": 0.8 } },
      { label: "Building AI/ML systems", value: "Q1_O5", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0, "Data Scientist": 0.6 } },
      { label: "Securing systems and applications", value: "Q1_O6", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0, "Penetration Tester": 0.9 } },
      { label: "Managing cloud infrastructure and deployments", value: "Q1_O7", careerWeights: { "Cloud Engineer": 1.0, "DevOps Engineer": 1.0, "Site Reliability Engineer": 0.9 } },
      { label: "Testing and improving software quality", value: "Q1_O8", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0, "Automation Tester": 0.9 } }
    ]
  },
  {
    section: "SECTION A — WORK AND ROLE PREFERENCE",
    question: "Q2:\nWhich activity would you enjoy most in a project?",
    order: 2,
    options: [
      { label: "Designing screens and user interactions", value: "Q2_O1", careerWeights: { "Frontend Developer": 1.0, "UI/UX Designer": 1.0, "Web Developer": 0.8 } },
      { label: "Creating APIs and business logic", value: "Q2_O2", careerWeights: { "Backend Developer": 1.0, "Java Developer": 0.8, "Python Developer": 0.8 } },
      { label: "Connecting frontend, backend, and database", value: "Q2_O3", careerWeights: { "Full Stack Developer": 1.0, "Software Engineer": 0.8 } },
      { label: "Analyzing datasets and finding patterns", value: "Q2_O4", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 0.9, "Business Analyst": 0.8 } },
      { label: "Training or integrating ML/AI models", value: "Q2_O5", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0, "Data Scientist": 0.7 } },
      { label: "Finding vulnerabilities and security issues", value: "Q2_O6", careerWeights: { "Cyber Security Analyst": 1.0, "Penetration Tester": 1.0, "Information Security Engineer": 0.9 } },
      { label: "Automating deployments and infrastructure", value: "Q2_O7", careerWeights: { "DevOps Engineer": 1.0, "Cloud Engineer": 0.9, "Site Reliability Engineer": 0.9 } },
      { label: "Finding bugs and improving software quality", value: "Q2_O8", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0, "Automation Tester": 0.9 } }
    ]
  },
  {
    section: "SECTION A — WORK AND ROLE PREFERENCE",
    question: "Q3:\nWhich project would you most like to build?",
    order: 3,
    options: [
      { label: "E-commerce/web application", value: "Q3_O1", careerWeights: { "Frontend Developer": 0.8, "Web Developer": 1.0, "Full Stack Developer": 0.8 } },
      { label: "Scalable backend/API platform", value: "Q3_O2", careerWeights: { "Backend Developer": 1.0, "Software Engineer": 0.8, "Java Developer": 0.7 } },
      { label: "Full-stack SaaS application", value: "Q3_O3", careerWeights: { "Full Stack Developer": 1.0, "Software Engineer": 0.8, "Software Developer": 0.8 } },
      { label: "Data analytics dashboard", value: "Q3_O4", careerWeights: { "Data Analyst": 1.0, "Data Engineer": 0.8, "Business Intelligence Analyst": 0.9 } },
      { label: "AI/ML application", value: "Q3_O5", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0, "Data Scientist": 0.8 } },
      { label: "Cybersecurity monitoring system", value: "Q3_O6", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0 } },
      { label: "Cloud/DevOps platform", value: "Q3_O7", careerWeights: { "DevOps Engineer": 1.0, "Cloud Engineer": 1.0, "Site Reliability Engineer": 0.9 } },
      { label: "Automated testing framework", value: "Q3_O8", careerWeights: { "SDET": 1.0, "Automation Tester": 1.0, "QA Engineer": 0.8 } }
    ]
  },
  {
    section: "SECTION A — WORK AND ROLE PREFERENCE",
    question: "Q4:\nWhich type of problem do you prefer?",
    order: 4,
    options: [
      { label: "Visual and interaction problems", value: "Q4_O1", careerWeights: { "Frontend Developer": 1.0, "UI/UX Designer": 1.0 } },
      { label: "Logic and backend problems", value: "Q4_O2", careerWeights: { "Backend Developer": 1.0, "Java Developer": 0.8, "Python Developer": 0.8 } },
      { label: "End-to-end application problems", value: "Q4_O3", careerWeights: { "Full Stack Developer": 1.0, "Software Engineer": 0.8 } },
      { label: "Numerical/data problems", value: "Q4_O4", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 0.9 } },
      { label: "Prediction/intelligence problems", value: "Q4_O5", careerWeights: { "AI/ML Engineer": 1.0, "Data Scientist": 0.8 } },
      { label: "Security/risk problems", value: "Q4_O6", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 0.9 } },
      { label: "Infrastructure/reliability problems", value: "Q4_O7", careerWeights: { "Cloud Engineer": 1.0, "DevOps Engineer": 1.0, "Site Reliability Engineer": 1.0 } },
      { label: "Quality/testing problems", value: "Q4_O8", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0 } }
    ]
  },
  {
    section: "SECTION A — WORK AND ROLE PREFERENCE",
    question: "Q5:\nWhich role direction currently interests you most?",
    order: 5,
    options: [
      { label: "Frontend", value: "Q5_O1", careerWeights: { "Frontend Developer": 1.0, "Web Developer": 0.8 } },
      { label: "Backend", value: "Q5_O2", careerWeights: { "Backend Developer": 1.0, "Java Developer": 0.8, "Python Developer": 0.8 } },
      { label: "Full Stack", value: "Q5_O3", careerWeights: { "Full Stack Developer": 1.0, "Software Engineer": 0.8 } },
      { label: "Data/Analytics", value: "Q5_O4", careerWeights: { "Data Analyst": 1.0, "Data Engineer": 0.8, "Data Scientist": 0.8 } },
      { label: "AI/ML", value: "Q5_O5", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0 } },
      { label: "Cybersecurity", value: "Q5_O6", careerWeights: { "Cyber Security Analyst": 1.0, "Penetration Tester": 0.9 } },
      { label: "Cloud/DevOps", value: "Q5_O7", careerWeights: { "DevOps Engineer": 1.0, "Cloud Engineer": 1.0, "Site Reliability Engineer": 0.8 } },
      { label: "QA/Automation", value: "Q5_O8", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0, "Automation Tester": 1.0 } }
    ]
  },
  {
    section: "SECTION B — PROBLEM-SOLVING AND LEARNING PREFERENCE",
    question: "Q6:\nWhen facing a difficult technical problem, what do you prefer to do first?",
    order: 6,
    options: [
      { label: "Break it into logical components", value: "Q6_O1", careerWeights: { "Software Engineer": 1.0, "Backend Developer": 0.8, "Full Stack Developer": 0.8 } },
      { label: "Visualize the problem", value: "Q6_O2", careerWeights: { "Frontend Developer": 1.0, "UI/UX Designer": 1.0 } },
      { label: "Analyze data/patterns", value: "Q6_O3", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 1.0, "Machine Learning Engineer": 0.8 } },
      { label: "Research and experiment", value: "Q6_O4", careerWeights: { "AI/ML Engineer": 0.8, "Data Scientist": 0.8, "Software Engineer": 0.6 } },
      { label: "Investigate possible vulnerabilities", value: "Q6_O5", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0 } },
      { label: "Test different implementations", value: "Q6_O6", careerWeights: { "SDET": 1.0, "QA Engineer": 0.8, "DevOps Engineer": 0.6 } }
    ]
  },
  {
    section: "SECTION B — PROBLEM-SOLVING AND LEARNING PREFERENCE",
    question: "Q7:\nWhich type of challenge is most satisfying?",
    order: 7,
    options: [
      { label: "Designing something people can use", value: "Q7_O1", careerWeights: { "Frontend Developer": 1.0, "Web Developer": 0.8 } },
      { label: "Making a system efficient", value: "Q7_O2", careerWeights: { "Backend Developer": 1.0, "Software Engineer": 0.8, "Data Engineer": 0.6 } },
      { label: "Solving a complex algorithmic problem", value: "Q7_O3", careerWeights: { "Software Engineer": 1.0, "Backend Developer": 0.8 } },
      { label: "Discovering patterns in data", value: "Q7_O4", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 1.0 } },
      { label: "Making a machine/system learn", value: "Q7_O5", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0 } },
      { label: "Finding and fixing security weaknesses", value: "Q7_O6", careerWeights: { "Cyber Security Analyst": 1.0, "Penetration Tester": 1.0 } },
      { label: "Making systems reliable", value: "Q7_O7", careerWeights: { "Site Reliability Engineer": 1.0, "DevOps Engineer": 1.0, "Cloud Engineer": 0.8 } },
      { label: "Automating repetitive processes", value: "Q7_O8", careerWeights: { "Automation Tester": 1.0, "DevOps Engineer": 0.8, "SDET": 0.8 } }
    ]
  },
  {
    section: "SECTION B — PROBLEM-SOLVING AND LEARNING PREFERENCE",
    question: "Q8:\nWhich result gives you the most satisfaction?",
    order: 8,
    options: [
      { label: "Better user experience", value: "Q8_O1", careerWeights: { "Frontend Developer": 1.0, "UI/UX Designer": 1.0 } },
      { label: "Faster backend/system", value: "Q8_O2", careerWeights: { "Backend Developer": 1.0, "Data Engineer": 0.8 } },
      { label: "Working end-to-end application", value: "Q8_O3", careerWeights: { "Full Stack Developer": 1.0, "Software Developer": 0.8 } },
      { label: "Useful business insight", value: "Q8_O4", careerWeights: { "Data Analyst": 1.0, "Business Intelligence Analyst": 1.0 } },
      { label: "Accurate prediction", value: "Q8_O5", careerWeights: { "Data Scientist": 1.0, "AI/ML Engineer": 1.0 } },
      { label: "Secure application", value: "Q8_O6", careerWeights: { "Information Security Engineer": 1.0, "Cyber Security Analyst": 1.0 } },
      { label: "Stable deployment", value: "Q8_O7", careerWeights: { "DevOps Engineer": 1.0, "Site Reliability Engineer": 1.0 } },
      { label: "Fewer defects", value: "Q8_O8", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0 } }
    ]
  },
  {
    section: "SECTION B — PROBLEM-SOLVING AND LEARNING PREFERENCE",
    question: "Q9:\nHow do you prefer learning a new technology?",
    order: 9,
    options: [
      { label: "Build a small project", value: "Q9_O1", careerWeights: { "Full Stack Developer": 1.0, "Web Developer": 0.8, "Software Developer": 0.8 } },
      { label: "Follow structured tutorials", value: "Q9_O2", careerWeights: { "Frontend Developer": 0.6, "Backend Developer": 0.6, "Data Analyst": 0.6 } },
      { label: "Solve practical problems", value: "Q9_O3", careerWeights: { "Software Engineer": 1.0, "Backend Developer": 0.8 } },
      { label: "Read documentation and experiment", value: "Q9_O4", careerWeights: { "DevOps Engineer": 1.0, "Cloud Engineer": 0.8, "Site Reliability Engineer": 0.8 } },
      { label: "Analyze examples and datasets", value: "Q9_O5", careerWeights: { "Data Scientist": 1.0, "AI/ML Engineer": 0.8, "Data Analyst": 0.8 } },
      { label: "Debug an existing system", value: "Q9_O6", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0, "Cyber Security Analyst": 0.8 } }
    ]
  },
  {
    section: "SECTION C — TECHNOLOGY AND DOMAIN INTEREST",
    question: "Q10:\nWhich area would you most like to explore deeply?",
    order: 10,
    options: [
      { label: "Web/software development", value: "Q10_O1", careerWeights: { "Full Stack Developer": 1.0, "Frontend Developer": 0.8, "Backend Developer": 0.8 } },
      { label: "AI and machine learning", value: "Q10_O2", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0, "Data Scientist": 0.8 } },
      { label: "Data engineering/analytics", value: "Q10_O3", careerWeights: { "Data Analyst": 1.0, "Data Engineer": 1.0, "Business Intelligence Analyst": 0.8 } },
      { label: "Cybersecurity", value: "Q10_O4", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0, "Penetration Tester": 1.0 } },
      { label: "Cloud/DevOps", value: "Q10_O5", careerWeights: { "DevOps Engineer": 1.0, "Cloud Engineer": 1.0, "Site Reliability Engineer": 1.0 } },
      { label: "Mobile development", value: "Q10_O6", careerWeights: { "Mobile Developer": 1.0, "Android Developer": 1.0, "iOS Developer": 1.0 } },
      { label: "Embedded/IoT", value: "Q10_O7", careerWeights: { "Embedded Systems Engineer": 1.0, "IoT Developer": 1.0 } },
      { label: "Enterprise applications", value: "Q10_O8", careerWeights: { "Java Developer": 1.0, ".NET Developer": 1.0, "Software Engineer": 0.8 } }
    ]
  },
  {
    section: "SECTION C — TECHNOLOGY AND DOMAIN INTEREST",
    question: "Q11:\nWhich emerging area interests you most?",
    order: 11,
    options: [
      { label: "Generative AI", value: "Q11_O1", careerWeights: { "AI/ML Engineer": 1.0, "Data Scientist": 0.8 } },
      { label: "MLOps", value: "Q11_O2", careerWeights: { "Machine Learning Engineer": 1.0, "DevOps Engineer": 0.6 } },
      { label: "Cloud-native systems", value: "Q11_O3", careerWeights: { "Cloud Engineer": 1.0, "DevOps Engineer": 0.8, "Backend Developer": 0.6 } },
      { label: "Cybersecurity", value: "Q11_O4", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0 } },
      { label: "Data engineering", value: "Q11_O5", careerWeights: { "Data Engineer": 1.0, "Data Analyst": 0.6 } },
      { label: "Automation/RPA", value: "Q11_O6", careerWeights: { "Automation Tester": 0.8, "Software Developer": 0.6, "SDET": 0.6 } },
      { label: "IoT/Edge computing", value: "Q11_O7", careerWeights: { "IoT Developer": 1.0, "Embedded Systems Engineer": 1.0 } },
      { label: "Blockchain/Web3", value: "Q11_O8", careerWeights: { "Blockchain Developer": 1.0, "Software Engineer": 0.6 } }
    ]
  },
  {
    section: "SECTION C — TECHNOLOGY AND DOMAIN INTEREST",
    question: "Q12:\nWhich type of system interests you most?",
    order: 12,
    options: [
      { label: "Consumer-facing application", value: "Q12_O1", careerWeights: { "Frontend Developer": 1.0, "Mobile Developer": 0.8, "Full Stack Developer": 0.8 } },
      { label: "Enterprise software", value: "Q12_O2", careerWeights: { "Java Developer": 1.0, ".NET Developer": 1.0, "Backend Developer": 0.8 } },
      { label: "Intelligent AI system", value: "Q12_O3", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0 } },
      { label: "Data platform", value: "Q12_O4", careerWeights: { "Data Engineer": 1.0, "Data Scientist": 0.8 } },
      { label: "Security platform", value: "Q12_O5", careerWeights: { "Information Security Engineer": 1.0, "Cyber Security Analyst": 1.0 } },
      { label: "Cloud infrastructure", value: "Q12_O6", careerWeights: { "Cloud Engineer": 1.0, "Site Reliability Engineer": 0.8 } },
      { label: "Embedded/connected system", value: "Q12_O7", careerWeights: { "Embedded Systems Engineer": 1.0, "IoT Developer": 1.0 } },
      { label: "Developer/testing tools", value: "Q12_O8", careerWeights: { "DevOps Engineer": 0.8, "SDET": 1.0 } }
    ]
  },
  {
    section: "SECTION C — TECHNOLOGY AND DOMAIN INTEREST",
    question: "Q13:\nWhere would you most like to see the impact of your work?",
    order: 13,
    options: [
      { label: "User-facing products", value: "Q13_O1", careerWeights: { "Frontend Developer": 1.0, "UI/UX Designer": 1.0 } },
      { label: "Business systems", value: "Q13_O2", careerWeights: { "Backend Developer": 0.8, "Software Developer": 0.8 } },
      { label: "Intelligent applications", value: "Q13_O3", careerWeights: { "AI/ML Engineer": 1.0, "Data Scientist": 0.8 } },
      { label: "Data-driven decisions", value: "Q13_O4", careerWeights: { "Data Analyst": 1.0, "Business Intelligence Analyst": 1.0 } },
      { label: "Security and protection", value: "Q13_O5", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0 } },
      { label: "Infrastructure and reliability", value: "Q13_O6", careerWeights: { "DevOps Engineer": 1.0, "Site Reliability Engineer": 1.0 } },
      { label: "Automation", value: "Q13_O7", careerWeights: { "Automation Tester": 1.0, "SDET": 1.0 } },
      { label: "New/emerging technologies", value: "Q13_O8", careerWeights: { "Software Engineer": 0.8, "AI/ML Engineer": 0.6 } }
    ]
  },
  {
    section: "SECTION D — WORK STYLE",
    question: "Q14:\nWhich environment do you prefer?",
    order: 14,
    options: [
      { label: "Highly structured", value: "Q14_O1", careerWeights: { "QA Engineer": 0.8, "Java Developer": 0.6, "Data Analyst": 0.6 } },
      { label: "Moderately structured", value: "Q14_O2", careerWeights: { "Software Engineer": 0.8, "Backend Developer": 0.8 } },
      { label: "Flexible", value: "Q14_O3", careerWeights: { "Full Stack Developer": 0.8, "Frontend Developer": 0.8 } },
      { label: "Highly exploratory", value: "Q14_O4", careerWeights: { "Data Scientist": 1.0, "AI/ML Engineer": 0.8, "Cyber Security Analyst": 0.6 } }
    ]
  },
  {
    section: "SECTION D — WORK STYLE",
    question: "Q15:\nWhat kind of work do you prefer?",
    order: 15,
    options: [
      { label: "Mostly independent", value: "Q15_O1", careerWeights: { "Backend Developer": 0.6, "Data Scientist": 0.6, "Information Security Engineer": 0.6 } },
      { label: "Mostly collaborative", value: "Q15_O2", careerWeights: { "Frontend Developer": 0.8, "Product Manager": 0.8, "QA Engineer": 0.8 } },
      { label: "A balance of both", value: "Q15_O3", careerWeights: { "Full Stack Developer": 0.8, "Software Engineer": 0.8, "DevOps Engineer": 0.8 } }
    ]
  },
  {
    section: "SECTION D — WORK STYLE",
    question: "Q16:\nWhich pace suits you better?",
    order: 16,
    options: [
      { label: "Carefully planned long-term work", value: "Q16_O1", careerWeights: { "Data Engineer": 0.8, "Cloud Architect": 0.8, "Java Developer": 0.6 } },
      { label: "Balanced planning and deadlines", value: "Q16_O2", careerWeights: { "Software Engineer": 0.8, "Backend Developer": 0.8 } },
      { label: "Fast-changing problems", value: "Q16_O3", careerWeights: { "DevOps Engineer": 0.8, "Site Reliability Engineer": 1.0, "Cyber Security Analyst": 0.8 } },
      { label: "Rapid experimentation", value: "Q16_O4", careerWeights: { "Data Scientist": 0.8, "AI/ML Engineer": 0.8, "Frontend Developer": 0.6 } }
    ]
  },
  {
    section: "SECTION D — WORK STYLE",
    question: "Q17:\nWhich responsibility sounds most appealing?",
    order: 17,
    options: [
      { label: "Building features", value: "Q17_O1", careerWeights: { "Frontend Developer": 1.0, "Full Stack Developer": 0.8 } },
      { label: "Designing technical solutions", value: "Q17_O2", careerWeights: { "Software Engineer": 1.0, "Cloud Engineer": 0.8 } },
      { label: "Analyzing information", value: "Q17_O3", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 0.8 } },
      { label: "Solving technical problems", value: "Q17_O4", careerWeights: { "Backend Developer": 1.0, "DevOps Engineer": 0.8 } },
      { label: "Improving reliability", value: "Q17_O5", careerWeights: { "Site Reliability Engineer": 1.0, "QA Engineer": 0.8 } },
      { label: "Leading technical decisions", value: "Q17_O6", careerWeights: { "Software Engineer": 0.6, "Cloud Architect": 0.6 } }
    ]
  },
  {
    section: "SECTION E — CAREER DIRECTION",
    question: "Q18:\nWhat is your current primary career goal?",
    order: 18,
    options: [
      { label: "Software development", value: "Q18_O1", careerWeights: { "Software Engineer": 1.0, "Full Stack Developer": 1.0, "Backend Developer": 1.0, "Frontend Developer": 1.0 } },
      { label: "AI/ML career", value: "Q18_O2", careerWeights: { "AI/ML Engineer": 1.0, "Machine Learning Engineer": 1.0 } },
      { label: "Data career", value: "Q18_O3", careerWeights: { "Data Analyst": 1.0, "Data Scientist": 1.0, "Data Engineer": 1.0 } },
      { label: "Cybersecurity career", value: "Q18_O4", careerWeights: { "Cyber Security Analyst": 1.0, "Information Security Engineer": 1.0 } },
      { label: "Cloud/DevOps career", value: "Q18_O5", careerWeights: { "DevOps Engineer": 1.0, "Cloud Engineer": 1.0 } },
      { label: "Testing/automation", value: "Q18_O6", careerWeights: { "QA Engineer": 1.0, "SDET": 1.0 } },
      { label: "Product/technical/business role", value: "Q18_O7", careerWeights: { "Business Analyst": 1.0, "Product Manager": 1.0 } },
      { label: "Still exploring", value: "Q18_O8", careerWeights: { "Software Developer": 0.5 } }
    ]
  },
  {
    section: "SECTION E — CAREER DIRECTION",
    question: "Q19:\nWhat type of career path would you prefer?",
    order: 19,
    options: [
      { label: "Become highly specialized in one technical area", value: "Q19_O1", careerWeights: { "Backend Developer": 0.8, "Java Developer": 0.8, "Information Security Engineer": 0.8 } },
      { label: "Become a broad full-stack engineer", value: "Q19_O2", careerWeights: { "Full Stack Developer": 1.0, "Software Engineer": 0.8 } },
      { label: "Become an AI/data specialist", value: "Q19_O3", careerWeights: { "AI/ML Engineer": 1.0, "Data Scientist": 1.0 } },
      { label: "Become a systems/cloud specialist", value: "Q19_O4", careerWeights: { "Cloud Engineer": 1.0, "DevOps Engineer": 1.0 } },
      { label: "Become a technical + business professional", value: "Q19_O5", careerWeights: { "Business Analyst": 1.0, "Data Analyst": 0.8 } },
      { label: "Explore multiple technical areas before specializing", value: "Q19_O6", careerWeights: { "Software Developer": 0.8 } }
    ]
  },
  {
    section: "SECTION E — CAREER DIRECTION",
    question: "Q20:\nHow certain are you about your current career direction?",
    order: 20,
    options: [
      { label: "1 — Very uncertain", value: "Q20_O1", careerWeights: {} },
      { label: "2 — Somewhat uncertain", value: "Q20_O2", careerWeights: {} },
      { label: "3 — Exploring", value: "Q20_O3", careerWeights: {} },
      { label: "4 — Fairly confident", value: "Q20_O4", careerWeights: {} },
      { label: "5 — Very confident", value: "Q20_O5", careerWeights: {} }
    ]
  }
];
