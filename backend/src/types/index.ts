export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  targetRole?: string | null;
  experienceLevel?: string | null;
  bio?: string | null;
  role: string;
  createdAt: Date;
}

export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationYear?: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    durationYears?: number;
    description?: string;
    highlights?: string[];
  }>;
  skills: Array<{
    name: string;
    category?: string;
    proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
  totalYearsExperience?: number;
  highestDegree?: string;
}

export interface ParsedJobData {
  requiredSkills: string[];
  preferredSkills: string[];
  softSkills: string[];
  experienceYearsRequired: number;
  educationRequirements: string;
  responsibilities: string[];
  keywords: string[];
}

export interface MatchCalculationResult {
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
}

export interface RubricScoreItem {
  score: number; // 0-100
  criteria: string;
  feedback: string;
}

export interface InterviewEvaluationResult {
  overallScore: number;
  relevanceScore: number;
  technicalScore: number;
  clarityScore: number;
  depthScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string;
  idealAnswerSample: string;
}
