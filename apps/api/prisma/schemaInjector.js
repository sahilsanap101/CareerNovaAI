const fs = require('fs');
const path = require('path');

const prismaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(prismaPath, 'utf8');

// 1. Update User model relations safely
if (!content.includes('GateQuestionAttempt[]')) {
    content = content.replace(
        '  gateProfile          UserGateProfile?',
        '  gateProfile          UserGateProfile?\n  gateQuestionAttempts GateQuestionAttempt[]\n  gateBookmarks        GateBookmark[]\n  gateTopicMasteries   GateTopicMastery[]\n  gateMistakes         GateMistakeTracker[]\n  gateRevisionItems    GateRevisionQueue[]\n  gateStudyPlans       GateStudyPlan[]\n  gateMockAttempts     GateMockAttempt[]\n  gateReadiness        GateReadinessSnapshot[]'
    );
}

// 2. Prepare the huge schema block
const newGateModels = `
enum GateQuestionType {
  MCQ
  MSQ
  NAT
}

enum GateDifficulty {
  EASY
  MEDIUM
  HARD
}

enum GateStudySessionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum GateMockStatus {
  UPCOMING
  IN_PROGRESS
  COMPLETED
}

enum GateMistakeType {
  CALCULATION
  CONCEPTUAL
  READING
  TIME_PRESSURE
}

enum GateOfficialStatus {
  OFFICIAL
  UNOFFICIAL
  VERIFIED
}

model GateExam {
  id                  String   @id @default(cuid())
  year                Int
  organizingInstitute String
  officialWebsite     String?
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())

  papers              GatePaper[]
  importantDates      GateImportantDate[]
  officialLinks       GateOfficialLink[]
  questions           GateQuestion[]
  studyPlans          GateStudyPlan[]
  mockTests           GateMockTest[]
  syncRecords         GateSyncRecord[]

  @@unique([year])
  @@map("gate_exams")
}

model GateImportantDate {
  id          String   @id @default(cuid())
  examId      String
  title       String
  date        DateTime
  description String?  @db.Text
  createdAt   DateTime @default(now())
  
  exam GateExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  @@index([examId])
  @@map("gate_important_dates")
}

model GateOfficialLink {
  id          String   @id @default(cuid())
  examId      String
  title       String
  url         String
  description String?  @db.Text
  createdAt   DateTime @default(now())

  exam GateExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  @@index([examId])
  @@map("gate_official_links")
}

model GatePaper {
  id         String   @id @default(cuid())
  examId     String
  paperCode  String   // e.g. "CS", "ME"
  paperName  String   // e.g. "Computer Science and Information Technology"
  examDate   DateTime?
  session    String?  // e.g. "Forenoon", "Afternoon"
  createdAt  DateTime @default(now())

  exam       GateExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  subjects   GateSyllabusSubject[]
  resources  GateResource[]
  questions  GateQuestion[]
  mockTests  GateMockTest[]

  @@unique([examId, paperCode])
  @@index([examId])
  @@map("gate_papers")
}

model GateSyllabusSubject {
  id               String   @id @default(cuid())
  paperId          String
  title            String
  weightagePercent Float?
  createdAt        DateTime @default(now())

  paper    GatePaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  topics   GateSyllabusTopic[]
  questions GateQuestion[]

  @@index([paperId])
  @@map("gate_syllabus_subjects")
}

model GateSyllabusTopic {
  id          String   @id @default(cuid())
  subjectId   String
  title       String
  description String?  @db.Text
  createdAt   DateTime @default(now())

  subject GateSyllabusSubject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  resources GateResource[]
  subtopics GateSubtopic[]
  questions GateQuestion[]
  
  prerequisitesGateTarget GateTopicPrerequisite[] @relation("TopicHasPrerequisite")
  prerequisitesGatePrereq GateTopicPrerequisite[] @relation("TopicIsPrerequisiteFor")
  
  mastery GateTopicMastery[]
  revisionItems GateRevisionQueue[]
  studySessions GateStudySession[]

  @@index([subjectId])
  @@map("gate_syllabus_topics")
}

model GateSubtopic {
  id          String   @id @default(cuid())
  topicId     String
  title       String
  description String?  @db.Text
  createdAt   DateTime @default(now())

  topic GateSyllabusTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)
  
  @@index([topicId])
  @@map("gate_subtopics")
}

model GateTopicPrerequisite {
  id              String   @id @default(cuid())
  targetTopicId   String
  prereqTopicId   String
  createdAt       DateTime @default(now())

  targetTopic GateSyllabusTopic @relation("TopicHasPrerequisite", fields: [targetTopicId], references: [id], onDelete: Cascade)
  prereqTopic GateSyllabusTopic @relation("TopicIsPrerequisiteFor", fields: [prereqTopicId], references: [id], onDelete: Cascade)

  @@index([targetTopicId])
  @@index([prereqTopicId])
  @@unique([targetTopicId, prereqTopicId])
  @@map("gate_topic_prerequisites")
}

model GateResource {
  id           String   @id @default(cuid())
  paperId      String
  topicId      String?
  title        String
  description  String?  @db.Text
  url          String
  provider     String   
  resourceType String   
  isOfficial   Boolean  @default(true)
  verifiedAt   DateTime?
  createdAt    DateTime @default(now())

  paper  GatePaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  topic  GateSyllabusTopic? @relation(fields: [topicId], references: [id], onDelete: SetNull)

  @@index([paperId])
  @@index([topicId])
  @@map("gate_resources")
}

model UserGateProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  targetYear            Int
  targetPaperCode       String
  expectedScore         Float?
  targetRank            Int?
  weeklyStudyHours      Int      @default(10)
  preparationStage      String   @default("BEGINNER") // BEGINNER, INTERMEDIATE, ADVANCED
  preferredLearningFormat String @default("VIDEO")
  diagnosticState       Json?    
  createdAt             DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_gate_profiles")
}

model GateQuestion {
  id              String   @id @default(cuid())
  examId          String
  paperId         String
  subjectId       String?
  topicId         String?
  subtopicId      String?
  questionNumber  Int?
  marks           Float
  questionType    GateQuestionType
  difficulty      GateDifficulty @default(MEDIUM)
  concept         String?
  content         String   @db.Text
  options         Json?    
  correctAnswer   String   
  explanation     String?  @db.Text
  sourceUrl       String?
  sourceProvider  String?
  status          GateOfficialStatus @default(UNOFFICIAL)
  version         Int      @default(1)
  createdAt       DateTime @default(now())

  exam     GateExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  paper    GatePaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  subject  GateSyllabusSubject? @relation(fields: [subjectId], references: [id], onDelete: SetNull)
  topic    GateSyllabusTopic? @relation(fields: [topicId], references: [id], onDelete: SetNull)
  
  attempts GateQuestionAttempt[]
  bookmarks GateBookmark[]
  mistakes GateMistakeTracker[]

  @@index([examId])
  @@index([paperId])
  @@index([topicId])
  @@map("gate_questions")
}

model GateQuestionAttempt {
  id           String   @id @default(cuid())
  userId       String
  questionId   String
  userAnswer   String?
  isCorrect    Boolean
  timeSpentsMs Int      @default(0)
  createdAt    DateTime @default(now())

  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
  question GateQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([questionId])
  @@map("gate_question_attempts")
}

model GateBookmark {
  id           String   @id @default(cuid())
  userId       String
  questionId   String
  notes        String?  @db.Text
  createdAt    DateTime @default(now())

  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
  question GateQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([userId])
  @@map("gate_bookmarks")
}

model GateTopicMastery {
  id           String   @id @default(cuid())
  userId       String
  topicId      String
  masteryLevel Float    // 0.0 to 100.0
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic GateSyllabusTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([userId, topicId])
  @@index([userId])
  @@map("gate_topic_mastery")
}

model GateMistakeTracker {
  id           String   @id @default(cuid())
  userId       String
  questionId   String
  mistakeType  GateMistakeType
  notes        String?  @db.Text
  resolved     Boolean  @default(false)
  createdAt    DateTime @default(now())

  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
  question GateQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([questionId])
  @@map("gate_mistake_tracker")
}

model GateRevisionQueue {
  id           String   @id @default(cuid())
  userId       String
  topicId      String
  nextReviewAt DateTime
  createdAt    DateTime @default(now())

  user  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic GateSyllabusTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([nextReviewAt])
  @@map("gate_revision_queue")
}

model GateStudyPlan {
  id           String   @id @default(cuid())
  userId       String
  targetExamId String
  title        String
  startDate    DateTime
  endDate      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
  exam     GateExam @relation(fields: [targetExamId], references: [id], onDelete: Cascade)
  sessions GateStudySession[]

  @@index([userId])
  @@map("gate_study_plans")
}

model GateStudySession {
  id           String   @id @default(cuid())
  planId       String
  topicId      String?
  title        String
  date         DateTime
  durationMins Int
  status       GateStudySessionStatus @default(PLANNED)
  createdAt    DateTime @default(now())

  plan  GateStudyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  topic GateSyllabusTopic? @relation(fields: [topicId], references: [id], onDelete: SetNull)

  @@index([planId])
  @@index([topicId])
  @@map("gate_study_sessions")
}

model GateMockTest {
  id           String   @id @default(cuid())
  examId       String
  paperId      String
  title        String
  description  String?  @db.Text
  durationMins Int      @default(180)
  totalMarks   Float    @default(100.0)
  isOfficial   Boolean  @default(false)
  createdAt    DateTime @default(now())

  exam    GateExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  paper   GatePaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  questions GateMockQuestion[]
  attempts  GateMockAttempt[]

  @@index([examId])
  @@index([paperId])
  @@map("gate_mock_tests")
}

model GateMockQuestion {
  id           String   @id @default(cuid())
  mockId       String
  questionText String   @db.Text
  options      Json?
  correctAnswer String
  marks        Float
  questionType GateQuestionType
  createdAt    DateTime @default(now())

  mock GateMockTest @relation(fields: [mockId], references: [id], onDelete: Cascade)
  answers GateMockAnswer[]

  @@index([mockId])
  @@map("gate_mock_questions")
}

model GateMockAttempt {
  id           String   @id @default(cuid())
  userId       String
  mockId       String
  status       GateMockStatus @default(IN_PROGRESS)
  score        Float?
  startedAt    DateTime @default(now())
  completedAt  DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  mock GateMockTest @relation(fields: [mockId], references: [id], onDelete: Cascade)
  answers GateMockAnswer[]
  analytics GateMockAnalytics?

  @@index([userId])
  @@index([mockId])
  @@map("gate_mock_attempts")
}

model GateMockAnswer {
  id           String   @id @default(cuid())
  attemptId    String
  questionId   String
  userAnswer   String?
  isCorrect    Boolean
  timeSpentMs  Int      @default(0)

  attempt  GateMockAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question GateMockQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([attemptId])
  @@index([questionId])
  @@map("gate_mock_answers")
}

model GateMockAnalytics {
  id           String   @id @default(cuid())
  attemptId    String   @unique
  percentile   Float?
  weakTopics   Json?
  strongTopics Json?
  createdAt    DateTime @default(now())

  attempt GateMockAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  @@map("gate_mock_analytics")
}

model GateReadinessSnapshot {
  id             String   @id @default(cuid())
  userId         String
  targetYear     Int
  readinessScore Float    // 0 to 100
  dimensions     Json     // { "mockScore": 80, "mastery": 70 }
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("gate_readiness_snapshots")
}

model GateSyncRecord {
  id             String   @id @default(cuid())
  examId         String
  entityType     String   // e.g. "SYLLABUS", "PYQ"
  lastSyncedAt   DateTime @default(now())
  status         String   // "SUCCESS", "FAILED"
  details        String?  @db.Text

  exam GateExam @relation(fields: [examId], references: [id], onDelete: Cascade)

  @@index([examId])
  @@map("gate_sync_records")
}
`;

// 3. Slice at Phase 6 and replace
const splitStr = '// ─── Phase 6: GATE Preparation Module ──────────────────────────────';
if (content.includes(splitStr)) {
    const parts = content.split(splitStr);
    const finalContent = parts[0] + splitStr + '\\n' + newGateModels + '\\n';
    fs.writeFileSync(prismaPath, finalContent, 'utf8');
    console.log('Successfully injected massive schema models.');
} else {
    console.log('Failed to find delimiter.');
}
