export interface User {
  id: string;
  email: string;
  fullName: string;
  targetRole?: string | null;
  experienceLevel?: string | null;
  bio?: string | null;
  role: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  isPrimary: boolean;
  parsedData: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    education?: Array<{
      institution: string;
      degree: string;
      graduationYear?: string;
    }>;
    experience?: Array<{
      company: string;
      title: string;
      startDate?: string;
      endDate?: string;
      durationYears?: number;
      description?: string;
      highlights?: string[];
    }>;
    skills?: Array<{
      name: string;
      category?: string;
      proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies?: string[];
    }>;
    totalYearsExperience?: number;
    highestDegree?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  experienceLevel: string;
  rawText: string;
  parsedData: {
    requiredSkills: string[];
    preferredSkills: string[];
    softSkills: string[];
    experienceYearsRequired: number;
    educationRequirements: string;
    responsibilities: string[];
    keywords: string[];
  };
  createdAt: string;
}

export interface MatchReport {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  overallMatchScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  breakdown: {
    weights: {
      skillsWeight: number;
      experienceWeight: number;
      educationWeight: number;
    };
    skillScoreDetails: {
      totalRequiredSkills: number;
      matchedCount: number;
      partialCount: number;
      missingCount: number;
      rawPercentage: number;
    };
    experienceScoreDetails: {
      requiredYears: number;
      candidateYears: number;
      ratioScore: number;
    };
    educationScoreDetails: {
      requiredEducation: string;
      candidateHighestDegree: string;
      alignmentScore: number;
    };
    formulaExplanation: string;
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'SKILL_GAP' | 'EXPERIENCE' | 'RESUME_OPTIMIZATION';
  }>;
  createdAt: string;
  resume?: { id: string; title: string; fileName: string };
  jobDescription?: { id: string; title: string; company: string };
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  verificationSource: 'SELF_REPORTED' | 'RESUME_EXTRACTED' | 'PROJECT_VERIFIED' | 'ASSESSMENT_VERIFIED';
  yearsExperience: number;
  skill: {
    id: string;
    name: string;
    category: string;
  };
}

export interface RoadmapMilestone {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  orderIndex: number;
  estimatedDays: number;
  topics: string[];
  resources: Array<{ title: string; url: string; type: string }>;
  projects: Array<{ title: string; description: string }>;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface CareerRoadmap {
  id: string;
  title: string;
  targetRole: string;
  durationDays: number;
  overview: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  milestones: RoadmapMilestone[];
  createdAt: string;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  problemStatement: string;
  technologies: string[];
  skillsDeveloped: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  implementationSteps: string[];
  expectedOutcome: string;
  portfolioValue: string;
  status: 'SAVED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  title: string;
  category: 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'ROLE_SPECIFIC' | 'PROJECT_BASED';
  targetRole: string;
  difficulty: 'ENTRY' | 'MID' | 'SENIOR';
  overallScore?: number | null;
  feedbackSummary?: string | null;
  createdAt: string;
  questions: Array<{
    id: string;
    questionText: string;
    orderIndex: number;
    idealAnswerPoints: string[];
    rubric: any;
    answers?: Array<{
      id: string;
      userText: string;
      score: number;
      relevanceScore: number;
      technicalScore: number;
      clarityScore: number;
      depthScore: number;
      feedback: string;
      strengths?: string[];
      weaknesses?: string[];
      improvementSuggestions: string;
    }>;
  }>;
}

export interface DashboardOverview {
  user: {
    fullName: string;
    targetRole: string;
    experienceLevel: string;
    memberSince: string;
  };
  metrics: {
    profileCompletionPercentage: number;
    careerReadinessScore: number;
    resumesUploaded: number;
    jobsAnalyzed: number;
    averageMatchScore: number;
    skillsIdentified: number;
    verifiedSkillsCount: number;
    totalInterviews: number;
    averageInterviewScore: number;
  };
  activeRoadmap: {
    id: string;
    title: string;
    targetRole: string;
    durationDays: number;
    totalMilestones: number;
    completedMilestones: number;
    completionPercentage: number;
  } | null;
  recentMatches: MatchReport[];
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
}
