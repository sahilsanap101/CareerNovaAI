import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  GraduationCap,
  Wrench,
  Heart,
  FolderGit2,
  Award,
  Code2,
  Target,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Star,
  Search,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Loader';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import {
  updateProfileSchema,
  careerGoalSchema,
  projectSchema,
  certificationSchema,
  codingPlatformSchema,
  type UpdateProfileInput,
  type CareerGoalInput,
  type ProjectInput,
  type CertificationInput,
  type CodingPlatformInput,
} from '@pathforge/shared-zod';

const STEPS = [
  { id: 1, name: 'Personal', icon: User },
  { id: 2, name: 'Academic', icon: GraduationCap },
  { id: 3, name: 'Skills', icon: Wrench },
  { id: 4, name: 'Interests', icon: Heart },
  { id: 5, name: 'Projects', icon: FolderGit2 },
  { id: 6, name: 'Certifications', icon: Award },
  { id: 7, name: 'Coding Profiles', icon: Code2 },
  { id: 8, name: 'Career Goals', icon: Target },
  { id: 9, name: 'Review', icon: CheckCircle2 },
];

export function ProfileWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const {
    studentData,
    isLoading,
    completion,
    masterSkills,
    masterInterests,
    updateProfile,
    addSkill,
    deleteSkill,
    addInterest,
    deleteInterest,
    updateCareerGoals,
    addProject,
    deleteProject,
    addCertification,
    deleteCertification,
    addCodingPlatform,
    deleteCodingPlatform,
  } = useStudentProfile();

  // Step 1 & 2 Form (Personal + Academic)
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      fullName: studentData?.fullName ?? '',
      college: studentData?.profile?.college ?? '',
      university: studentData?.profile?.university ?? '',
      degree: studentData?.profile?.degree ?? '',
      branch: studentData?.profile?.branch ?? '',
      specialization: studentData?.profile?.specialization ?? '',
      currentYear: studentData?.profile?.currentYear ?? undefined,
      currentSemester: studentData?.profile?.currentSemester ?? undefined,
      graduationYear: studentData?.profile?.graduationYear ?? undefined,
      cgpa: studentData?.profile?.cgpa ?? undefined,
      bio: studentData?.profile?.bio ?? '',
      profileImage: studentData?.profile?.profileImage ?? '',
      city: studentData?.profile?.city ?? '',
      country: studentData?.profile?.country ?? 'India',
    },
  });

  // Step 5 Form (Projects)
  const projectForm = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { completionStatus: 'COMPLETED' },
  });

  // Step 6 Form (Certifications)
  const certForm = useForm<CertificationInput>({
    resolver: zodResolver(certificationSchema),
  });

  // Step 7 Form (Coding Platforms)
  const codingForm = useForm<CodingPlatformInput>({
    resolver: zodResolver(codingPlatformSchema),
    defaultValues: { problemsSolved: 0 },
  });

  // Step 8 Form (Career Goals)
  const careerForm = useForm<CareerGoalInput>({
    resolver: zodResolver(careerGoalSchema),
    values: {
      preferredJobRole: studentData?.careerGoal?.preferredJobRole ?? '',
      preferredIndustry: studentData?.careerGoal?.preferredIndustry ?? '',
      preferredWorkMode: studentData?.careerGoal?.preferredWorkMode ?? 'HYBRID',
      preferredCountries: studentData?.careerGoal?.preferredCountries ?? '',
      expectedSalary: studentData?.careerGoal?.expectedSalary ?? '',
      higherStudies: studentData?.careerGoal?.higherStudies ?? false,
      entrepreneurship: studentData?.careerGoal?.entrepreneurship ?? false,
      governmentJobs: studentData?.careerGoal?.governmentJobs ?? false,
      startup: studentData?.careerGoal?.startup ?? false,
      research: studentData?.careerGoal?.research ?? false,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Filter skills by search & category
  const categories = ['ALL', ...Array.from(new Set(masterSkills.map((s) => s.category)))];
  const filteredSkills = masterSkills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(skillSearch.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Completion Header Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Profile Wizard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Complete your profile to unlock personalized engineering career insights.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                {completion?.completionPercentage ?? 0}%
              </span>
              <p className="text-xs text-slate-400">Profile Score</p>
            </div>
          </div>

          <div className="w-full bg-slate-150 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-full transition-all duration-500"
              style={{ width: `${completion?.completionPercentage ?? 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wizard Steps Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all ${isActive
                ? 'bg-primary-600 text-white shadow-md'
                : isCompleted
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{step.name}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Cards */}
      <Card>
        <CardContent className="p-6">
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <form onSubmit={profileForm.handleSubmit((d) => updateProfile(d))} className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details about you</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input {...profileForm.register('fullName')} error={profileForm.formState.errors.fullName?.message as string} label="Full Name" placeholder="Arjun Sharma" />
                <Input {...profileForm.register('profileImage')} error={profileForm.formState.errors.profileImage?.message as string} label="Profile Image URL" placeholder="https://..." />
                <Input {...profileForm.register('city')} error={profileForm.formState.errors.city?.message as string} label="City" placeholder="Mumbai" />
                <Input {...profileForm.register('country')} error={profileForm.formState.errors.country?.message as string} label="Country" placeholder="India" />
              </div>

              <Textarea {...profileForm.register('bio')} error={profileForm.formState.errors.bio?.message as string} label="Bio / About Yourself" rows={3} placeholder="Describe your background and core interests..." />

              <Button type="submit" size="sm">Save Personal Info</Button>
            </form>
          )}

          {/* STEP 2: Academic Info */}
          {currentStep === 2 && (
            <form onSubmit={profileForm.handleSubmit((d) => updateProfile(d))} className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Academic Details</CardTitle>
                <CardDescription>Your current college and degree program</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input {...profileForm.register('college')} error={profileForm.formState.errors.college?.message as string} label="College / Institute" placeholder="IIT Bombay" />
                <Input {...profileForm.register('university')} error={profileForm.formState.errors.university?.message as string} label="University" placeholder="IIT Bombay" />
                <Input {...profileForm.register('degree')} error={profileForm.formState.errors.degree?.message as string} label="Degree" placeholder="B.Tech" />
                <Input {...profileForm.register('branch')} error={profileForm.formState.errors.branch?.message as string} label="Branch" placeholder="Computer Science" />
                <Input {...profileForm.register('specialization')} error={profileForm.formState.errors.specialization?.message as string} label="Specialization" placeholder="Artificial Intelligence" />

                <Select
                  {...profileForm.register('currentYear', { valueAsNumber: true })}
                  error={profileForm.formState.errors.currentYear?.message as string}
                  label="Current Year"
                  options={[1, 2, 3, 4, 5, 6].map((y) => ({ value: y, label: `Year ${y}` }))}
                  placeholder="Select Year"
                />

                <Select
                  {...profileForm.register('currentSemester', { valueAsNumber: true })}
                  error={profileForm.formState.errors.currentSemester?.message as string}
                  label="Current Semester"
                  options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }))}
                  placeholder="Select Semester"
                />

                <Input
                  {...profileForm.register('graduationYear', { valueAsNumber: true })}
                  error={profileForm.formState.errors.graduationYear?.message as string}
                  label="Graduation Year"
                  type="number"
                  placeholder="2026"
                />

                <Input
                  {...profileForm.register('cgpa', { valueAsNumber: true })}
                  error={profileForm.formState.errors.cgpa?.message as string}
                  label="CGPA (0 - 10)"
                  type="number"
                  step="0.01"
                  placeholder="8.5"
                />
              </div>

              <Button type="submit" size="sm">Save Academic Details</Button>
            </form>
          )}

          {/* STEP 3: Skills Management */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Technical Skills</CardTitle>
                <CardDescription>Select skills and rate your proficiency (1-5) and confidence (0-100)</CardDescription>
              </CardHeader>

              {/* Current Added Skills */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Skills ({studentData?.skills.length ?? 0})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentData?.skills.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{s.skill.name}</span>
                          <Badge variant="default" className="text-xs">{s.skill.category}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Proficiency: {s.proficiency}/5 • Exp: {s.experienceMonths}m • Confidence: {s.confidence}%
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteSkill(s.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search & Filter Master Skills */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add New Skill</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Search skill (e.g. React, Python, Docker)..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                    />
                  </div>
                  <div className="w-48">
                    <Select
                      options={categories.map((c) => ({ value: c, label: c }))}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 max-h-48 overflow-y-auto">
                  {filteredSkills.map((mSkill) => {
                    const alreadyAdded = studentData?.skills.some((s) => s.skill.id === mSkill.id);
                    return (
                      <button
                        key={mSkill.id}
                        disabled={alreadyAdded}
                        onClick={() => addSkill({ skillId: mSkill.id, proficiency: 3, experienceMonths: 6, confidence: 70 })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${alreadyAdded
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100'
                          }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {mSkill.name} ({mSkill.category})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Interests Management */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Interests & Domains</CardTitle>
                <CardDescription>Select domains you are passionate about (Max 10)</CardDescription>
              </CardHeader>

              {/* Current Interests */}
              <div className="flex flex-wrap gap-2">
                {studentData?.interests.map((i) => (
                  <div key={i.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium">
                    <span>{i.interest.name}</span>
                    <button onClick={() => deleteInterest(i.id)} className="hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Available Master Interests */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Available Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {masterInterests.map((mInt) => {
                    const added = studentData?.interests.some((i) => i.interest.id === mInt.id);
                    return (
                      <button
                        key={mInt.id}
                        disabled={added}
                        onClick={() => addInterest({ interestId: mInt.id, priority: 1 })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${added
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                          }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {mInt.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Projects */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Projects</CardTitle>
                <CardDescription>Showcase your hands-on coding projects</CardDescription>
              </CardHeader>

              {/* Project List */}
              <div className="space-y-3">
                {studentData?.projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{p.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-2">Tech: {p.technologies}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteProject(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Project Form */}
              <form onSubmit={projectForm.handleSubmit((d) => { addProject(d); projectForm.reset(); })} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add New Project</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input {...projectForm.register('title')} error={projectForm.formState.errors.title?.message as string} label="Project Title" placeholder="AI Portfolio Website" />
                  <Input {...projectForm.register('technologies')} error={projectForm.formState.errors.technologies?.message as string} label="Technologies Used" placeholder="React, Node.js, PostgreSQL" />
                  <Input {...projectForm.register('githubUrl')} error={projectForm.formState.errors.githubUrl?.message as string} label="GitHub Repository URL" placeholder="https://github.com/..." />
                  <Input {...projectForm.register('demoUrl')} error={projectForm.formState.errors.demoUrl?.message as string} label="Live Demo URL" placeholder="https://..." />
                </div>
                <Textarea {...projectForm.register('description')} error={projectForm.formState.errors.description?.message as string} label="Project Description" rows={2} placeholder="Summary of what you built..." />
                <Button type="submit" size="sm">Add Project</Button>
              </form>
            </div>
          )}

          {/* STEP 6: Certifications */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Certifications</CardTitle>
                <CardDescription>Verified courses and professional certificates</CardDescription>
              </CardHeader>

              <div className="space-y-3">
                {studentData?.certifications.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{c.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Issuer: {c.issuer}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteCertification(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <form onSubmit={certForm.handleSubmit((d) => { addCertification(d); certForm.reset(); })} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Certification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input {...certForm.register('title')} error={certForm.formState.errors.title?.message as string} label="Certification Title" placeholder="AWS Certified Developer" />
                  <Input {...certForm.register('issuer')} error={certForm.formState.errors.issuer?.message as string} label="Issuing Organization" placeholder="Amazon Web Services" />
                  <Input {...certForm.register('issueDate')} error={certForm.formState.errors.issueDate?.message as string} label="Issue Date" placeholder="2025-06" />
                  <Input {...certForm.register('credentialUrl')} error={certForm.formState.errors.credentialUrl?.message as string} label="Credential Verification URL" placeholder="https://..." />
                </div>
                <Button type="submit" size="sm">Add Certification</Button>
              </form>
            </div>
          )}

          {/* STEP 7: Coding Profiles */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Coding Profiles</CardTitle>
                <CardDescription>Connect competitive programming platforms</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studentData?.codingPlatforms.map((cp) => (
                  <div key={cp.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{cp.platform}</span>
                      <p className="text-xs text-slate-500">@{cp.username} ({cp.problemsSolved} solved)</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteCodingPlatform(cp.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <form onSubmit={codingForm.handleSubmit((d) => { addCodingPlatform(d); codingForm.reset(); })} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Coding Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    {...codingForm.register('platform')}
                    error={codingForm.formState.errors.platform?.message as string}
                    label="Platform"
                    options={[
                      { value: 'LeetCode', label: 'LeetCode' },
                      { value: 'Codeforces', label: 'Codeforces' },
                      { value: 'HackerRank', label: 'HackerRank' },
                      { value: 'CodeChef', label: 'CodeChef' },
                      { value: 'GeeksforGeeks', label: 'GeeksforGeeks' },
                      { value: 'GitHub', label: 'GitHub' },
                    ]}
                    placeholder="Select Platform"
                  />
                  <Input {...codingForm.register('username')} error={codingForm.formState.errors.username?.message as string} label="Username" placeholder="your_handle" />
                  <Input {...codingForm.register('problemsSolved', { valueAsNumber: true })} error={codingForm.formState.errors.problemsSolved?.message as string} label="Problems Solved" type="number" placeholder="150" />
                </div>
                <Button type="submit" size="sm">Add Profile</Button>
              </form>
            </div>
          )}

          {/* STEP 8: Career Goals */}
          {currentStep === 8 && (
            <form onSubmit={careerForm.handleSubmit((d) => updateCareerGoals(d))} className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Career Goals</CardTitle>
                <CardDescription>Your target roles, preferred industries, and long-term aspirations</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input {...careerForm.register('preferredJobRole')} error={careerForm.formState.errors.preferredJobRole?.message as string} label="Target Job Role" placeholder="Backend Engineer / ML Engineer" />
                <Input {...careerForm.register('preferredIndustry')} error={careerForm.formState.errors.preferredIndustry?.message as string} label="Target Industry" placeholder="FinTech / AI / SaaS" />
                <Select
                  {...careerForm.register('preferredWorkMode')}
                  error={careerForm.formState.errors.preferredWorkMode?.message as string}
                  label="Preferred Work Mode"
                  options={[
                    { value: 'REMOTE', label: 'Remote' },
                    { value: 'HYBRID', label: 'Hybrid' },
                    { value: 'ONSITE', label: 'Onsite' },
                  ]}
                />
                <Input {...careerForm.register('preferredCountries')} error={careerForm.formState.errors.preferredCountries?.message as string} label="Preferred Countries" placeholder="India, Germany, USA" />
                <Input {...careerForm.register('expectedSalary')} error={careerForm.formState.errors.expectedSalary?.message as string} label="Expected Salary Range" placeholder="15 - 25 LPA" />
              </div>

              <div className="pt-3 space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aspirations & Pathways</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Checkbox {...careerForm.register('higherStudies')} label="Higher Studies (MS/M.Tech)" />
                  <Checkbox {...careerForm.register('startup')} label="Join Early-stage Startup" />
                  <Checkbox {...careerForm.register('entrepreneurship')} label="Build Own Company" />
                  <Checkbox {...careerForm.register('research')} label="Research & Academia" />
                  <Checkbox {...careerForm.register('governmentJobs')} label="Government Sector" />
                </div>
              </div>

              <Button type="submit" size="sm">Save Career Goals</Button>
            </form>
          )}

          {/* STEP 9: Review & Summary */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Profile Review & Completion</CardTitle>
                <CardDescription>Review your complete student profile summary</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Profile Completion</span>
                  <p className="text-3xl font-extrabold text-primary-600 mt-1">{completion?.completionPercentage}%</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Missing Sections</span>
                  {completion?.missingSections.length === 0 ? (
                    <p className="text-sm text-green-600 font-semibold mt-2">🎉 Profile is 100% complete!</p>
                  ) : (
                    <ul className="text-xs text-amber-600 dark:text-amber-400 mt-1 space-y-1">
                      {completion?.missingSections.map((m) => (
                        <li key={m}>• {m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls (Previous / Next) */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 1}
              onClick={prevStep}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>

            <Button
              size="sm"
              disabled={currentStep === STEPS.length}
              onClick={nextStep}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
