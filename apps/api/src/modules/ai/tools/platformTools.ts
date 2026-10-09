import { getFullStudentData } from '@/modules/profile/repositories/profile.repository';

export async function executePlatformTool(toolName: string, userId: string): Promise<string> {
  switch (toolName) {
    case 'getStudentProfile': {
      const student = await getFullStudentData(userId);
      return JSON.stringify({
        fullName: student?.fullName,
        college: student?.profile?.college,
        degree: student?.profile?.degree,
        cgpa: student?.profile?.cgpa,
        skillsCount: student?.skills.length,
        projectsCount: student?.projects.length,
      });
    }


    default:
      return JSON.stringify({ status: 'Tool not found' });
  }
}
