const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SOURCE_TEXT = `
1. Software & Web Development

Frontend Developer:
HTML, CSS, JavaScript, TypeScript, React.js, Next.js, Responsive Design, REST APIs, Git, GitHub, npm, Jest, Web Performance

Backend Developer:
Java, Python, Node.js, C#, OOP, Data Structures, SQL, REST APIs, Authentication, PostgreSQL, MySQL, MongoDB, Git, Docker, Unit Testing

Full Stack Developer:
HTML, CSS, JavaScript, TypeScript, React.js, Node.js, Java, Python, REST APIs, SQL, MongoDB, Authentication, Git, Docker, Deployment, Basic AWS

Web Developer:
HTML, CSS, JavaScript, React.js, Angular, Vue.js, Responsive Design, REST APIs, SQL, Git, Web Security, Browser DevTools

Software Developer:
Java, Python, C++, C#, OOP, Data Structures & Algorithms, SQL, Git, REST APIs, Debugging, Unit Testing, SDLC, Problem Solving

Software Engineer:
Java, Python, C++, C#, DSA, OOP, DBMS, Operating Systems, Computer Networks, Git, REST APIs, System Design Basics, Testing, Debugging, Agile

Java Developer:
Java, OOP, Collections, Exception Handling, Multithreading, JDBC, SQL, Spring, Spring Boot, REST APIs, Hibernate/JPA, Maven, Gradle, Git, JUnit

Python Developer:
Python, OOP, Data Structures, SQL, Django, Flask, FastAPI, REST APIs, PostgreSQL, MySQL, Git, pytest, APIs, Docker

.NET Developer:
C#, .NET, ASP.NET Core, OOP, Entity Framework Core, LINQ, SQL Server, REST APIs, Web API, Azure Basics, Git, Unit Testing

API / Integration Developer:
REST, SOAP, JSON, XML, HTTP/HTTPS, API Authentication, OAuth 2.0, JWT, API Gateway, Postman, SQL, Java, Python, Node.js, Microservices, Git

Embedded Software Engineer:
C, C++, Data Structures, Embedded C, Microcontrollers, ARM, RTOS, UART, SPI, I2C, CAN, GPIO, Debugging, Linux, Git

Blockchain / Web3 Developer:
Blockchain Fundamentals, Ethereum, Solidity, Smart Contracts, JavaScript, TypeScript, React.js, Node.js, Web3.js, Ethers.js, Wallet Integration, Hardhat, Foundry, Cryptography Basics, Git

2. Mobile Development

Android Developer:
Kotlin, Java, Android SDK, Android Studio, Jetpack Compose, XML, Android Architecture, REST APIs, JSON, Room Database, Firebase, Git

Cross-platform Mobile Developer:
Flutter, Dart, React Native, JavaScript, TypeScript, Mobile UI, REST APIs, State Management, Firebase, SQLite, Git, Android Basics, iOS Basics

3. Artificial Intelligence & Machine Learning

AI Engineer:
Python, Mathematics, Statistics, Machine Learning, Deep Learning, NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow, APIs, SQL, Git, Cloud, Model Deployment

Machine Learning Engineer:
Python, NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow, Statistics, Linear Algebra, Probability, Feature Engineering, Model Evaluation, SQL, Git, Docker, ML Deployment

Generative AI Engineer:
Python, LLMs, Transformers, Prompt Engineering, OpenAI/LLM APIs, Hugging Face, RAG, Embeddings, Vector Databases, LangChain, LlamaIndex, Fine-tuning, APIs, Docker, Git

Computer Vision Engineer:
Python, OpenCV, NumPy, PyTorch, TensorFlow, CNNs, Image Processing, Object Detection, YOLO, Image Classification, Segmentation, Computer Vision Algorithms, Git

NLP Engineer:
Python, NLP, NLTK, spaCy, Transformers, Hugging Face, BERT, LLMs, Tokenization, Text Classification, Embeddings, PyTorch, TensorFlow, RAG, Vector Databases

MLOps Engineer:
Python, Machine Learning, Docker, Kubernetes, Git, CI/CD, MLflow, Kubeflow, Airflow, AWS, Azure, GCP, Terraform, Model Deployment, Model Monitoring, Data Pipelines

AI Product / Applied AI Developer:
Python, LLM APIs, Prompt Engineering, RAG, LangChain, LlamaIndex, APIs, React.js, SQL, Vector Databases, AI Agents, Model Evaluation, Docker, Git

AI Data / Annotation Quality Specialist:
Data Annotation, Data Labeling, Python Basics, SQL Basics, Data Quality, Dataset Validation, AI/ML Basics, NLP Basics, Computer Vision Basics, Excel, Google Sheets, Quality Control, Documentation

4. Data Science & Analytics

Data Scientist:
Python, SQL, Statistics, Probability, Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn, Machine Learning, Feature Engineering, Data Visualization, Power BI, Tableau, Git

Data Analyst:
SQL, Excel, Python, Pandas, Statistics, Power BI, Tableau, Data Visualization, Data Cleaning, Dashboards, Business Analysis, Reporting

Data Engineer:
Python, Java, Scala, SQL, ETL, ELT, Data Warehousing, Apache Spark, Airflow, Kafka, AWS, Azure, GCP, Databases, Data Lakes, Docker, Git

Big Data Engineer:
Python, Java, Scala, Hadoop, Spark, Kafka, Hive, HDFS, SQL, NoSQL, ETL, Data Pipelines, Airflow, Cloud Platforms, Linux, Git

Database Engineer / DBA:
SQL, MySQL, PostgreSQL, Oracle, SQL Server, Database Design, Indexing, Query Optimization, Backup & Recovery, Replication, Performance Tuning, Security, Linux, Cloud Databases

BI Developer / BI Analyst:
SQL, Power BI, Tableau, Excel, DAX, Data Modeling, ETL, Power Query, Data Warehousing, Dashboards, KPIs, Business Analysis

Product Analyst:
SQL, Excel, Python, Statistics, Product Metrics, A/B Testing, Data Visualization, Power BI, Tableau, Product Analytics, User Behavior Analysis, Business Communication

Data Quality Engineer:
SQL, Python, Data Validation, Data Profiling, ETL Testing, Data Quality Frameworks, Data Governance, Data Cleaning, Database Testing, Automation, Excel, Git

5. Cloud & Infrastructure

Cloud Engineer:
AWS, Azure, GCP, Linux, Networking, IAM, EC2, VMs, S3, Storage, VPC, Docker, Kubernetes, Terraform, Git, Python, Bash, Monitoring

Cloud Data Engineer:
AWS, Azure, GCP, Python, SQL, Spark, ETL, ELT, Data Warehousing, Data Lakes, Kafka, Airflow, S3, ADLS, GCS, Databases, Docker, Terraform

Cloud Support Engineer:
AWS, Azure, GCP, Linux, Networking, TCP/IP, DNS, HTTP/HTTPS, IAM, Cloud Monitoring, Troubleshooting, SQL Basics, Bash, Python, Ticketing, Technical Documentation

DevOps Engineer:
Linux, Git, GitHub, GitLab, Docker, Kubernetes, AWS, Azure, GCP, Jenkins, GitHub Actions, CI/CD, Terraform, Ansible, Bash, Python, Monitoring, Prometheus, Grafana

Site Reliability Engineer:
Linux, Python, Go, AWS, GCP, Azure, Kubernetes, Docker, Terraform, CI/CD, Prometheus, Grafana, Observability, Logging, Incident Management, SLI, SLO, SLA, Distributed Systems

Platform Engineer:
AWS, Azure, GCP, Kubernetes, Docker, Terraform, Linux, CI/CD, GitHub Actions, Jenkins, Helm, Python, Go, Networking, Observability, Developer Platforms

Release / Build Engineer:
Git, GitHub, GitLab, Jenkins, GitHub Actions, CI/CD, Maven, Gradle, Docker, Build Automation, Release Management, Versioning, Linux, Shell Scripting, Artifact Repositories

Network Engineer:
TCP/IP, OSI Model, Routing, Switching, DNS, DHCP, VLAN, Subnetting, Firewalls, VPN, Cisco, Linux, Network Security, Wireshark, Cloud Networking

Systems Engineer:
Linux, Windows Server, Networking, Bash, PowerShell, Python, System Administration, Active Directory, Virtualization, VMware, Cloud Basics, Monitoring, Troubleshooting, Security

IoT Engineer:
C, C++, Python, Embedded Systems, Microcontrollers, Sensors, MQTT, HTTP, Raspberry Pi, Arduino, ESP32, IoT Protocols, Linux, Cloud IoT, Networking, Git

6. Cybersecurity

Cybersecurity Analyst:
Networking, Linux, Windows, SIEM, Log Analysis, Incident Response, Vulnerability Management, Security Fundamentals, IAM, Threat Detection, Python, Bash, Security Tools

Cybersecurity Engineer:
Networking, Linux, Python, Firewalls, IDS/IPS, SIEM, IAM, Cloud Security, Vulnerability Management, Encryption, Security Automation, Docker Security, Kubernetes Security

Application Security Engineer:
Web Security, OWASP Top 10, Secure Coding, SAST, DAST, SCA, Burp Suite, API Security, Authentication, Authorization, Git, CI/CD, Threat Modeling

Cloud Security Engineer:
AWS, Azure, GCP, IAM, VPC, Networking, Encryption, KMS, Security Groups, CloudTrail, CloudWatch, SIEM, Terraform, Kubernetes Security, Vulnerability Management, DevSecOps

Penetration Tester / Ethical Hacker:
Networking, Linux, Web Security, OWASP Top 10, Burp Suite, Nmap, Metasploit, Wireshark, Kali Linux, Python, Bash, API Security, Vulnerability Assessment, Reporting

SOC Analyst:
SIEM, Splunk, QRadar, Sentinel, Networking, Windows Logs, Linux Logs, Incident Response, Threat Detection, Malware Basics, IDS/IPS, MITRE ATT&CK, Vulnerability Management, Security Monitoring

7. Quality Assurance & Testing

QA Engineer:
Software Testing, Manual Testing, Test Cases, Test Scenarios, SDLC, STLC, Regression Testing, API Testing, SQL, Jira, Postman, Git, Bug Tracking

Automation Test Engineer:
Selenium, Playwright, Cypress, Java, Python, JavaScript, API Testing, REST, Postman, SQL, TestNG, JUnit, PyTest, Git, CI/CD, Automation Frameworks

SDET:
Java, Python, JavaScript, DSA, OOP, Selenium, Playwright, API Testing, SQL, Automation Frameworks, Unit Testing, CI/CD, Docker, Git, Jenkins, Debugging

8. Enterprise & IT Consulting

Business Analyst:
Requirements Gathering, SQL, Excel, UML, Use Cases, User Stories, Agile, Scrum, Jira, BRD, FRD, Process Mapping, Data Analysis, Communication

IT / Technical Support Engineer:
Windows, Linux, Networking, TCP/IP, DNS, DHCP, Hardware Basics, Troubleshooting, Active Directory, Microsoft 365, PowerShell, Bash, Ticketing Systems, ITIL Basics

Technical Support / Application Support Engineer:
SQL, Linux, Windows, Application Troubleshooting, REST APIs, Logs, Networking, Databases, Monitoring, Shell Scripting, Ticketing, Incident Management, ITIL

Technical Consultant:
Programming Basics, SQL, APIs, Cloud Basics, System Architecture, Database Fundamentals, Requirements Gathering, Solution Design, Troubleshooting, Documentation, Communication

Solutions Engineer / Associate Solutions Consultant:
APIs, SQL, Cloud Basics, Networking, Product Knowledge, Solution Design, Technical Presentations, POC Development, Python, JavaScript, REST, Troubleshooting, Communication

Salesforce Developer:
Salesforce, Apex, SOQL, SOSL, Lightning Web Components, JavaScript, HTML, CSS, Salesforce APIs, Data Modeling, Git, Salesforce Flow

ServiceNow Developer:
ServiceNow, JavaScript, Glide API, ServiceNow Administration, ITSM, REST APIs, SOAP APIs, Business Rules, Client Scripts, UI Policies, Workflows, SQL Basics, Git

SAP Technology Developer / Consultant:
SAP, ABAP, SAP HANA, SQL, OOP, Fiori, SAPUI5, JavaScript, APIs, Integration, ERP Fundamentals, Business Process Knowledge

RPA / Automation Developer:
UiPath, Automation Anywhere, Power Automate, Python, C#, VB.NET, Workflow Automation, SQL, APIs, Excel Automation, OCR, Process Mapping, Debugging, Git

9. Product & Design

UI/UX Designer:
Figma, UI Design, UX Research, Wireframing, Prototyping, Design Systems, User Flows, Information Architecture, Usability Testing, Responsive Design, HTML, CSS, Accessibility

Technical Writer / Developer Documentation Specialist:
Technical Writing, Markdown, Git, GitHub, REST APIs, API Documentation, OpenAPI, Swagger, HTML, CSS, Documentation Tools, Diagrams, Developer Workflows, Research, Communication
`;

async function main() {
  const lines = SOURCE_TEXT.split(/\r?\n/);
  
  let currentCategory = 'General';
  const skillsMap = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if category
    const categoryMatch = line.match(/^\d+\.\s+(.*)$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      continue;
    }
    
    // If line ends with ':' it's a career name, next line is skills
    if (line.endsWith(':')) {
      const skillsLine = lines[i+1]?.trim() || '';
      i++; // skip next line as we parse it here
      
      if (skillsLine) {
        // split by comma
        const tokens = skillsLine.split(',');
        for (let token of tokens) {
          token = token.trim();
          if (!token) continue;
          
          // split by " OR " and "/"
          const subTokens = token.split(/\s+OR\s+|\//i);
          for (let subToken of subTokens) {
             subToken = subToken.trim();
             if (!subToken) continue;
             
             if (!skillsMap.has(subToken.toLowerCase())) {
               skillsMap.set(subToken.toLowerCase(), {
                 name: subToken,
                 canonical_name: subToken,
                 category: currentCategory,
                 aliases: [],
               });
             }
          }
        }
      }
    }
  }

  // Handle aliases (e.g., ReactJS -> React.js)
  // Let's explicitly set some aliases based on prompt
  const aliasRules = [
    ['ReactJS', 'React.js'],
    ['NodeJS', 'Node.js'],
    ['Postgres', 'PostgreSQL'],
    ['PyTest', 'pytest'],
    ['PowerBI', 'Power BI'],
    ['VueJS', 'Vue.js'],
    ['NextJS', 'Next.js']
  ];
  
  for (const [alias, canonical] of aliasRules) {
    if (skillsMap.has(canonical.toLowerCase())) {
      const skill = skillsMap.get(canonical.toLowerCase());
      if (!skill.aliases.includes(alias)) {
        skill.aliases.push(alias);
      }
    } else {
       // if not exists, create it
       skillsMap.set(canonical.toLowerCase(), {
         name: canonical,
         canonical_name: canonical,
         category: 'General',
         aliases: [alias]
       });
    }
  }

  const finalSkills = Array.from(skillsMap.values()).map((s, idx) => {
    // Generate an ID if needed, but we'll try to match existing first
    return {
      ...s,
      skill_id: "SK_NEW_" + idx, // temp
    };
  });

  console.log("Parsed " + finalSkills.length + " unique skills.");

  // Load existing CSV
  const csvPath = path.resolve(__dirname, '../../research/data/skill_catalog_pathforge_2026.csv');
  let existingSkills = [];
  try {
    existingSkills = parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
    console.log("Loaded " + existingSkills.length + " existing skills from CSV.");
  } catch (err) {
    console.error('No existing CSV found', err);
  }

  const existingMap = new Map();
  existingSkills.forEach(s => {
    existingMap.set(s.skill.toLowerCase(), s);
  });

  // Merge & Assign IDs
  let nextId = existingSkills.length > 0 ? 
       Math.max(...existingSkills.map(s => parseInt(s.skill_id.replace(/[^0-9]/g, '') || '0'))) + 1 : 1;

  const outputCsvData = [];
  const validIds = new Set();
  
  for (const newSkill of finalSkills) {
     const nameLower = newSkill.name.toLowerCase();
     let existing = existingMap.get(nameLower);
     
     let skill_id = existing ? existing.skill_id : "SK_" + nameLower.replace(/[^a-z0-9]/g, '_');
     
     outputCsvData.push({
       skill_id: skill_id,
       skill: newSkill.name,
       skill_name: newSkill.name, // adding to meet requirement
       canonical_name: newSkill.canonical_name,
       category: newSkill.category,
       skill_category: newSkill.category, // legacy column
       aliases: newSkill.aliases.join('|'),
       active: 'true',
       careers_count: existing ? existing.careers_count : 1,
       proficiency_scale: '0=None, 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert'
     });
     validIds.add(skill_id);
  }

  // Add deactivated legacy skills
  let deprecatedCount = 0;
  for (const ext of existingSkills) {
     if (!validIds.has(ext.skill_id)) {
        outputCsvData.push({
           skill_id: ext.skill_id,
           skill: ext.skill,
           skill_name: ext.skill,
           canonical_name: ext.skill,
           category: ext.skill_category,
           skill_category: ext.skill_category,
           aliases: ext.aliases || '',
           active: 'false',
           careers_count: ext.careers_count || 0,
           proficiency_scale: ext.proficiency_scale
        });
        deprecatedCount++;
     }
  }

  console.log("Generated " + outputCsvData.length + " total rows (" + deprecatedCount + " deprecated).");

  // Write CSV
  const header = Object.keys(outputCsvData[0]).join(',');
  const csvLines = outputCsvData.map(row => {
    return Object.values(row).map(val => {
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
  });
  const csvString = [header, ...csvLines].join('\n');
  fs.writeFileSync(csvPath, csvString);
  console.log('Saved CSV to', csvPath);

  // Update DB
  let dbUpdates = 0;
  let dbDeprecated = 0;
  for (const row of outputCsvData) {
     const isActive = row.active === 'true';
     
     if (isActive) {
        await prisma.skill.upsert({
          where: { name: row.skill },
          update: {
            category: row.category,
            canonicalName: row.canonical_name,
            aliases: row.aliases ? row.aliases.split('|') : []
          },
          create: {
            id: row.skill_id,
            name: row.skill,
            category: row.category,
            canonicalName: row.canonical_name,
            aliases: row.aliases ? row.aliases.split('|') : []
          }
        });
        dbUpdates++;
     } else {
        // Just leave them in the DB or add an active flag if it existed, but we don't have it.
        // We will just keep them so existing user profiles don't break.
        dbDeprecated++;
     }
  }

  console.log("DB updated. Active: " + dbUpdates + ", Deprecated: " + dbDeprecated);
  console.log('Total unique canonical skills:', finalSkills.length);
  const cats = new Set(finalSkills.map(s => s.category));
  console.log('Total categories:', cats.size);
}

main().catch(console.error).finally(() => prisma.$disconnect());
