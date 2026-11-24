import { prisma } from '../config/db.js';

export class AnalyticsService {
  /**
   * Get user overview dashboard statistics calculated from real DB data
   */
  public static async getUserOverview(userId: string) {
    const [
      user,
      resumesCount,
      jobsCount,
      matchReports,
      userSkills,
      roadmaps,
      interviews,
      recentActivities,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, targetRole: true, experienceLevel: true, createdAt: true },
      }),
      prisma.resume.count({ where: { userId } }),
      prisma.jobDescription.count({ where: { userId } }),
      prisma.matchReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          overallMatchScore: true,
          skillMatchScore: true,
          experienceMatchScore: true,
          educationMatchScore: true,
          createdAt: true,
          jobDescription: { select: { title: true, company: true } },
        },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.careerRoadmap.findMany({
        where: { userId },
        include: { milestones: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    // Average match score
    const avgMatchScore = matchReports.length > 0
      ? Math.round(matchReports.reduce((acc, m) => acc + m.overallMatchScore, 0) / matchReports.length)
      : 0;

    // Roadmap completion calculation
    let roadmapCompletionPercentage = 0;
    let activeRoadmap = null;
    if (roadmaps.length > 0) {
      const active = roadmaps[0];
      const totalMilestones = active.milestones.length;
      const completedMilestones = active.milestones.filter(m => m.isCompleted).length;
      roadmapCompletionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
      activeRoadmap = {
        id: active.id,
        title: active.title,
        targetRole: active.targetRole,
        durationDays: active.durationDays,
        totalMilestones,
        completedMilestones,
        completionPercentage: roadmapCompletionPercentage,
      };
    }

    // Interview stats
    const totalInterviews = interviews.length;
    const scoredInterviews = interviews.filter(i => i.overallScore !== null);
    const avgInterviewScore = scoredInterviews.length > 0
      ? Math.round(scoredInterviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / scoredInterviews.length)
      : 0;

    // Verified skills
    const verifiedSkillsCount = userSkills.filter(
      s => s.verificationSource === 'PROJECT_VERIFIED' || s.verificationSource === 'ASSESSMENT_VERIFIED'
    ).length;

    // Career Readiness Indicator (Composite: 35% skills count & verification, 35% match score, 15% roadmap progress, 15% interview performance)
    const skillFactor = Math.min(100, (userSkills.length * 6) + (verifiedSkillsCount * 8));
    const matchFactor = avgMatchScore > 0 ? avgMatchScore : 30;
    const roadmapFactor = roadmapCompletionPercentage > 0 ? roadmapCompletionPercentage : 20;
    const interviewFactor = avgInterviewScore > 0 ? avgInterviewScore : 40;

    const careerReadinessScore = Math.min(
      100,
      Math.round(skillFactor * 0.35 + matchFactor * 0.35 + roadmapFactor * 0.15 + interviewFactor * 0.15)
    );

    // Profile completion calculation
    let profileFieldsFilled = 1; // email is always present
    if (user?.fullName) profileFieldsFilled++;
    if (user?.targetRole) profileFieldsFilled++;
    if (user?.experienceLevel) profileFieldsFilled++;
    if (resumesCount > 0) profileFieldsFilled++;
    if (userSkills.length > 0) profileFieldsFilled++;
    const profileCompletionPercentage = Math.round((profileFieldsFilled / 6) * 100);

    return {
      user: {
        fullName: user?.fullName || 'Candidate',
        targetRole: user?.targetRole || 'Full Stack Engineer',
        experienceLevel: user?.experienceLevel || 'ENTRY',
        memberSince: user?.createdAt,
      },
      metrics: {
        profileCompletionPercentage,
        careerReadinessScore,
        resumesUploaded: resumesCount,
        jobsAnalyzed: jobsCount,
        averageMatchScore: avgMatchScore,
        skillsIdentified: userSkills.length,
        verifiedSkillsCount,
        totalInterviews,
        averageInterviewScore: avgInterviewScore,
      },
      activeRoadmap,
      recentMatches: matchReports.slice(0, 5),
      recentActivities,
    };
  }

  /**
   * Detailed Progress & Chart Analytics
   */
  public static async getUserProgressAnalytics(userId: string) {
    const [userSkills, matchReports, interviews, roadmaps] = await Promise.all([
      prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.matchReport.findMany({
        where: { userId },
        include: { jobDescription: { select: { title: true, company: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.careerRoadmap.findMany({
        where: { userId },
        include: { milestones: true },
      }),
    ]);

    // 1. Skill category distribution
    const categoryCounts: Record<string, number> = {};
    for (const us of userSkills) {
      const cat = us.skill.category || 'Technical';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    const skillDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // 2. Match Score Trend
    const matchTrends = matchReports.map(m => ({
      date: m.createdAt.toISOString().slice(0, 10),
      jobTitle: m.jobDescription.title,
      overallScore: m.overallMatchScore,
      skillScore: m.skillMatchScore,
      experienceScore: m.experienceMatchScore,
    }));

    // 3. Interview Performance Trend by category
    const interviewTrends = interviews.map(i => ({
      date: i.createdAt.toISOString().slice(0, 10),
      category: i.category,
      score: i.overallScore || 0,
    }));

    // 4. Verification Breakdown
    const verificationBreakdown = {
      selfReported: userSkills.filter(s => s.verificationSource === 'SELF_REPORTED').length,
      resumeExtracted: userSkills.filter(s => s.verificationSource === 'RESUME_EXTRACTED').length,
      projectVerified: userSkills.filter(s => s.verificationSource === 'PROJECT_VERIFIED').length,
      assessmentVerified: userSkills.filter(s => s.verificationSource === 'ASSESSMENT_VERIFIED').length,
    };

    return {
      skillDistribution,
      matchTrends,
      interviewTrends,
      verificationBreakdown,
      totalRoadmaps: roadmaps.length,
    };
  }
}
