import { parseJobDescription, runDeterministicMatch, Requirement } from './resumeMatcher.service';

describe('Resume Matcher Service', () => {
  describe('parseJobDescription', () => {
    it('TEST 1: OR-group requirement parsing', () => {
      const jd = "At least one programming language such as Java, Python, C++, or JavaScript/TypeScript.";
      const reqs = parseJobDescription(jd);
      
      const orGroup = reqs.find(r => r.logic === 'OR_GROUP');
      expect(orGroup).toBeDefined();
      expect(orGroup?.alternatives).toContain('Java');
      expect(orGroup?.alternatives).toContain('Python');
      expect(orGroup?.alternatives).toContain('C++');
      // normalizeSkill will convert 'javascript' to 'JavaScript' and 'typescript' to 'TypeScript'
      expect(orGroup?.alternatives).toContain('JavaScript');
      expect(orGroup?.alternatives).toContain('TypeScript');
    });

    it('TEST 2: AND requirement parsing', () => {
      const jd = "Java and SQL and Git";
      const reqs = parseJobDescription(jd);
      
      expect(reqs.map(r => r.canonicalSkill)).toContain('Java');
      expect(reqs.map(r => r.canonicalSkill)).toContain('SQL');
      expect(reqs.map(r => r.canonicalSkill)).toContain('Git');
    });

    it('TEST 8: Preferred vs Required distinction', () => {
      const jd = `
        Required:
        Java
        Preferred:
        Docker, AWS, Kubernetes
      `;
      const reqs = parseJobDescription(jd);
      
      const java = reqs.find(r => r.canonicalSkill === 'Java');
      expect(java?.requirementType).toBe('REQUIRED');

      const docker = reqs.find(r => r.canonicalSkill === 'Docker');
      expect(docker?.requirementType).toBe('PREFERRED');
    });
  });

  describe('runDeterministicMatch Evidence & Scoring', () => {
    it('TEST 3: OOP exact alias match', () => {
      const resume = "Object Oriented Programming";
      const jd = "OOP";
      const result = runDeterministicMatch(resume, jd);
      expect(result.skillsYouHave.some(s => s.includes('OOP'))).toBe(true);
      expect(result.missingRequiredSkills).not.toContain('OOP');
    });

    it('TEST 4: React alias match', () => {
      const resume = "React.js";
      const jd = "React";
      const result = runDeterministicMatch(resume, jd);
      expect(result.skillsYouHave.some(s => s.includes('React.js'))).toBe(true);
      expect(result.missingRequiredSkills).not.toContain('React.js');
    });

    it('TEST 5: SpringBoot alias match', () => {
      const resume = "SpringBoot";
      const jd = "Spring Boot";
      const result = runDeterministicMatch(resume, jd);
      expect(result.skillsYouHave.some(s => s.includes('Spring Boot'))).toBe(true);
      expect(result.missingRequiredSkills).not.toContain('Spring Boot');
    });

    it('TEST 6: DSA evidence', () => {
      const resume = "500+ DSA Questions";
      const jd = "Data Structures and Algorithms";
      const result = runDeterministicMatch(resume, jd);
      expect(result.skillsYouHave.some(s => s.includes('DSA'))).toBe(true);
    });

    it('TEST 7: Coursework extraction', () => {
      const resume = `
        Coursework:
        Object Oriented Programming, Database Systems
      `;
      const jd = "OOP";
      const result = runDeterministicMatch(resume, jd);
      
      const detail = result.matchDetails.find(d => d.canonicalSkill === 'OOP');
      expect(detail?.evidenceSection).toBe('COURSEWORK');
      expect(detail?.matchStatus).toBe('SATISFIED');
    });

    it('TEST 30: SAHIL REGRESSION TEST', () => {
      const resume = `
        SAHIL SANAP
        B.Tech Artificial Intelligence
        Diploma in Information Technology
        
        EXPERIENCE
        Java Developer Internship
        - Java, OOP, software development, testing, debugging
        
        PROJECTS
        PayFlow
        - Java, Spring Boot, React.js, Microservices, Apache Kafka, MySQL, REST APIs, JWT
        
        ACHIEVEMENTS
        - 500+ DSA questions
        
        SKILLS
        Java, Python, SQL, Git, GitHub
      `;

      const jd = `
        REQUIRED / CORE:
        - Strong programming fundamentals
        - Data Structures and Algorithms
        - Object-Oriented Programming
        - Problem Solving
        - At least one programming language such as Java, Python, C++, or JavaScript/TypeScript
        - Database and SQL fundamentals
        - Software development fundamentals
        - Git / Version Control
        - API development and integration
        - Web/application development fundamentals

        PREFERRED / ADDITIONAL:
        - React
        - Angular
        - Node.js
        - Spring Boot
        - REST APIs
        - PostgreSQL
        - MySQL
        - MongoDB
        - Docker
        - AWS
        - Azure
        - GCP
        - CI/CD
        - DevOps
        - AI/ML fundamentals
        - Generative AI
        - AI-assisted development
        - Microservices
        - Open-source contribution
      `;

      const result = runDeterministicMatch(resume, jd);

      // Verify Missing Required logic (Must NOT contain OR-group alternatives)
      expect(result.missingRequiredSkills).not.toContain('C++');
      expect(result.missingRequiredSkills).not.toContain('JavaScript');
      expect(result.missingRequiredSkills).not.toContain('TypeScript');
      expect(result.missingRequiredSkills).not.toContain('OOP');
      expect(result.missingRequiredSkills).not.toContain('DSA');
      
      // Preferred skills must not bleed into Required
      expect(result.missingRequiredSkills).not.toContain('Node.js');
      expect(result.missingRequiredSkills).not.toContain('AWS');
      expect(result.missingRequiredSkills).not.toContain('Docker');
      
      // Found skills verification
      const found = result.skillsYouHave.join(' ');
      expect(found).toContain('Java');
      expect(found).toContain('React.js');
      expect(found).toContain('Spring Boot');
      expect(found).toContain('REST APIs');
      expect(found).toContain('Microservices');
      expect(found).toContain('MySQL');
      expect(found).toContain('Git');
      expect(found).toContain('OOP');
      expect(found).toContain('DSA');
      
      // Verify Missing Preferred Skills logic
      expect(result.missingPreferredSkills).toContain('Docker');
      expect(result.missingPreferredSkills).toContain('AWS');
      expect(result.missingPreferredSkills).toContain('Node.js');
    });
  });
});
