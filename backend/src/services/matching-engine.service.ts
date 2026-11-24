import { ParsedResumeData, ParsedJobData, MatchCalculationResult } from '../types/index.js';

interface SkillEntry {
  name: string;
  normalized: string;
  source?: string;
  proficiency?: string;
}

export class MatchingEngineService {
  // Configurable weights
  private static readonly WEIGHTS = {
    SKILLS: 0.60,
    EXPERIENCE: 0.25,
    EDUCATION: 0.15,
  };

  /**
   * Main deterministic match calculation
   */
  public static calculateMatch(
    resumeData: ParsedResumeData,
    jobData: ParsedJobData,
    userVerifiedSkills: Array<{ name: string; proficiencyLevel: string; verificationSource: string }> = []
  ): MatchCalculationResult {
    // 1. Compile all candidate skills from resume + verified user skills
    const candidateSkillMap = new Map<string, SkillEntry>();

    // From parsed resume
    if (resumeData.skills && Array.isArray(resumeData.skills)) {
      for (const s of resumeData.skills) {
        if (s && s.name) {
          const norm = this.normalizeSkillName(s.name);
          candidateSkillMap.set(norm, {
            name: s.name,
            normalized: norm,
            source: 'RESUME',
            proficiency: s.proficiency || 'INTERMEDIATE',
          });
        }
      }
    }

    // From verified user skills table (takes precedence/enriches)
    for (const us of userVerifiedSkills) {
      if (us && us.name) {
        const norm = this.normalizeSkillName(us.name);
        candidateSkillMap.set(norm, {
          name: us.name,
          normalized: norm,
          source: us.verificationSource,
          proficiency: us.proficiencyLevel,
        });
      }
    }

    // Also scan projects technologies
    if (resumeData.projects && Array.isArray(resumeData.projects)) {
      for (const p of resumeData.projects) {
        if (p.technologies && Array.isArray(p.technologies)) {
          for (const tech of p.technologies) {
            const norm = this.normalizeSkillName(tech);
            if (!candidateSkillMap.has(norm)) {
              candidateSkillMap.set(norm, {
                name: tech,
                normalized: norm,
                source: 'PROJECT',
                proficiency: 'INTERMEDIATE',
              });
            }
          }
        }
      }
    }

    // 2. Evaluate Required Skills
    const requiredSkills = jobData.requiredSkills || [];
    const matchedSkills: string[] = [];
    const partialSkills: string[] = [];
    const missingSkills: string[] = [];

    let skillScorePoints = 0;
    const totalRequired = Math.max(requiredSkills.length, 1);

    for (const reqSkill of requiredSkills) {
      const normReq = this.normalizeSkillName(reqSkill);

      if (candidateSkillMap.has(normReq)) {
        matchedSkills.push(reqSkill);
        skillScorePoints += 1.0;
      } else {
        // Check partial / family match (e.g. Postgres -> SQL, React -> React Native, Express -> Node)
        const isPartial = this.checkPartialMatch(normReq, Array.from(candidateSkillMap.keys()));
        if (isPartial) {
          partialSkills.push(reqSkill);
          skillScorePoints += 0.6; // partial credit
        } else {
          missingSkills.push(reqSkill);
        }
      }
    }

    // Calculate raw skill percentage
    let rawSkillPercentage = (skillScorePoints / totalRequired) * 100;

    // Bonus for preferred skills (up to +10%)
    let preferredBonus = 0;
    if (jobData.preferredSkills && jobData.preferredSkills.length > 0) {
      let matchedPref = 0;
      for (const pref of jobData.preferredSkills) {
        const normPref = this.normalizeSkillName(pref);
        if (candidateSkillMap.has(normPref)) matchedPref++;
      }
      preferredBonus = Math.min(10, (matchedPref / jobData.preferredSkills.length) * 10);
    }

    const finalSkillMatchScore = Math.min(100, Math.round(rawSkillPercentage + preferredBonus));

    // 3. Experience Match
    const requiredYears = jobData.experienceYearsRequired ?? 2;
    const candidateYears = resumeData.totalYearsExperience ?? (resumeData.experience?.length ? resumeData.experience.length * 1.5 : 1);

    let experienceScore = 100;
    if (requiredYears > 0) {
      const ratio = candidateYears / requiredYears;
      if (ratio >= 1) {
        experienceScore = 100;
      } else {
        // Linear scale with 50 baseline for 0 experience
        experienceScore = Math.max(40, Math.round(ratio * 100));
      }
    }

    // 4. Education Match
    const candidateDegree = (resumeData.highestDegree || resumeData.education?.[0]?.degree || '').toLowerCase();
    const reqEducation = (jobData.educationRequirements || '').toLowerCase();

    let educationScore = 85; // Baseline for accredited / active degree
    if (candidateDegree.includes('master') || candidateDegree.includes('m.s') || candidateDegree.includes('phd')) {
      educationScore = 100;
    } else if (candidateDegree.includes('bachelor') || candidateDegree.includes('b.tech') || candidateDegree.includes('b.s')) {
      educationScore = 90;
    } else if (candidateDegree.includes('diploma') || candidateDegree.includes('associate')) {
      educationScore = 75;
    }

    // If job has specific requirements
    if (reqEducation.includes('master') && !candidateDegree.includes('master') && !candidateDegree.includes('phd')) {
      educationScore = 75;
    }

    // 5. Final Overall Score Calculation
    const overallMatchScore = Math.round(
      finalSkillMatchScore * this.WEIGHTS.SKILLS +
      experienceScore * this.WEIGHTS.EXPERIENCE +
      educationScore * this.WEIGHTS.EDUCATION
    );

    // 6. Actionable Recommendations
    const recommendations: MatchCalculationResult['recommendations'] = [];

    if (missingSkills.length > 0) {
      recommendations.push({
        title: `Bridge Critical Skill Gaps: ${missingSkills.slice(0, 3).join(', ')}`,
        description: `This role strongly requires ${missingSkills.slice(0, 3).join(', ')}. Generating a focused roadmap or building a project featuring these technologies will raise your match score significantly.`,
        priority: 'HIGH',
        category: 'SKILL_GAP',
      });
    }

    if (partialSkills.length > 0) {
      recommendations.push({
        title: `Formalize Competency in: ${partialSkills.join(', ')}`,
        description: `You have adjacent or foundational background in these skills. Adding specific project metrics or taking an assessment will elevate them to fully matched.`,
        priority: 'MEDIUM',
        category: 'SKILL_GAP',
      });
    }

    if (candidateYears < requiredYears) {
      recommendations.push({
        title: 'Highlight Project Depth to Counterbalance Years of Experience',
        description: `The job asks for ${requiredYears} years of experience vs your estimated ${candidateYears} years. Emphasize production-level architecture and quantitative outcomes in your project portfolio.`,
        priority: 'MEDIUM',
        category: 'EXPERIENCE',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Outstanding Match Profile',
        description: 'Your background aligns exceptionally well with the core criteria. Focus on preparing role-specific mock interview questions to stand out.',
        priority: 'LOW',
        category: 'RESUME_OPTIMIZATION',
      });
    }

    return {
      overallMatchScore,
      skillMatchScore: finalSkillMatchScore,
      experienceMatchScore: experienceScore,
      educationMatchScore: educationScore,
      matchedSkills,
      partialSkills,
      missingSkills,
      breakdown: {
        weights: {
          skillsWeight: this.WEIGHTS.SKILLS * 100,
          experienceWeight: this.WEIGHTS.EXPERIENCE * 100,
          educationWeight: this.WEIGHTS.EDUCATION * 100,
        },
        skillScoreDetails: {
          totalRequiredSkills: totalRequired,
          matchedCount: matchedSkills.length,
          partialCount: partialSkills.length,
          missingCount: missingSkills.length,
          rawPercentage: Math.round(rawSkillPercentage),
        },
        experienceScoreDetails: {
          requiredYears,
          candidateYears: Math.round(candidateYears * 10) / 10,
          ratioScore: experienceScore,
        },
        educationScoreDetails: {
          requiredEducation: jobData.educationRequirements || 'Bachelor degree or equivalent',
          candidateHighestDegree: resumeData.highestDegree || 'Bachelor degree',
          alignmentScore: educationScore,
        },
        formulaExplanation: `Final Score = (Skills: ${finalSkillMatchScore}% × 60%) + (Experience: ${experienceScore}% × 25%) + (Education: ${educationScore}% × 15%) = ${overallMatchScore}%`,
      },
      recommendations,
    };
  }

  public static normalizeSkillName(skill: string): string {
    const cleaned = skill
      .toLowerCase()
      .trim()
      .replace(/[\s\-_.]+/g, '');

    if (cleaned === 'nodejs' || cleaned === 'node') return 'node';
    if (cleaned === 'reactjs' || cleaned === 'react') return 'react';
    if (cleaned === 'vuejs' || cleaned === 'vue') return 'vue';
    if (cleaned === 'nextjs' || cleaned === 'next') return 'next';
    if (cleaned === 'expressjs' || cleaned === 'express') return 'express';

    return cleaned;
  }

  private static checkPartialMatch(targetNorm: string, candidateNorms: string[]): boolean {
    const skillFamilies: Record<string, string[]> = {
      sql: ['postgresql', 'mysql', 'sqlite', 'oracle', 'mariadb'],
      postgresql: ['sql', 'database'],
      react: ['reactnative', 'nextjavascript', 'frontend'],
      node: ['express', 'backend', 'nestjavascript'],
      docker: ['kubernetes', 'containers', 'devops'],
      aws: ['cloud', 'gcp', 'azure'],
      python: ['django', 'fastapi', 'flask', 'datascience'],
      typescript: ['javascript'],
      html: ['css', 'frontend', 'web'],
      css: ['tailwind', 'bootstrap', 'sass'],
    };

    for (const [key, relatedList] of Object.entries(skillFamilies)) {
      if (targetNorm.includes(key) || key.includes(targetNorm)) {
        for (const rel of relatedList) {
          if (candidateNorms.some(c => c.includes(rel) || rel.includes(c))) {
            return true;
          }
        }
      }
    }

    // Substring match
    return candidateNorms.some(c => (c.length > 3 && targetNorm.includes(c)) || (targetNorm.length > 3 && c.includes(targetNorm)));
  }
}
