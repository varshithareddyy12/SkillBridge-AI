import { describe, it, expect } from 'vitest';
import { MatchingEngineService } from '../src/services/matching-engine.service.js';
import { ParsedResumeData, ParsedJobData } from '../src/types/index.js';

describe('Intelligent Job Matching Engine', () => {
  const sampleResume: ParsedResumeData = {
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    skills: [
      { name: 'React', category: 'Frontend', proficiency: 'ADVANCED' },
      { name: 'TypeScript', category: 'Frontend', proficiency: 'ADVANCED' },
      { name: 'Node.js', category: 'Backend', proficiency: 'INTERMEDIATE' },
      { name: 'PostgreSQL', category: 'Database', proficiency: 'INTERMEDIATE' },
      { name: 'Git', category: 'Tools', proficiency: 'EXPERT' },
    ],
    experience: [
      {
        company: 'Tech Corp',
        title: 'Full Stack Engineer',
        durationYears: 2,
        description: 'Built web applications',
      },
    ],
    education: [
      {
        institution: 'State University',
        degree: "Bachelor's of Science in Computer Science",
        graduationYear: '2024',
      },
    ],
    projects: [
      {
        name: 'Task Manager',
        description: 'Kanban board',
        technologies: ['React', 'Express', 'Docker'],
      },
    ],
    totalYearsExperience: 2,
    highestDegree: "Bachelor's Degree in Computer Science",
  };

  const sampleJob: ParsedJobData = {
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    preferredSkills: ['AWS', 'Redis'],
    softSkills: ['Teamwork', 'Communication'],
    experienceYearsRequired: 2,
    educationRequirements: "Bachelor's Degree in Computer Science",
    responsibilities: ['Develop full stack features'],
    keywords: ['React', 'TypeScript', 'Node.js'],
  };

  it('calculates deterministic score accurately with high matching skills', () => {
    const result = MatchingEngineService.calculateMatch(sampleResume, sampleJob);

    expect(result.overallMatchScore).toBeGreaterThanOrEqual(80);
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('TypeScript');
    expect(result.matchedSkills).toContain('Node.js');
    expect(result.matchedSkills).toContain('PostgreSQL');
    // Docker was in projects technologies!
    expect(result.matchedSkills).toContain('Docker');
    expect(result.missingSkills.length).toBe(0);
    expect(result.breakdown.weights.skillsWeight).toBe(60);
    expect(result.breakdown.weights.experienceWeight).toBe(25);
    expect(result.breakdown.weights.educationWeight).toBe(15);
  });

  it('identifies missing skills and adjusts score accordingly', () => {
    const demandingJob: ParsedJobData = {
      requiredSkills: ['React', 'Go', 'Kubernetes', 'GraphQL', 'Rust'],
      preferredSkills: ['Kafka'],
      softSkills: ['Leadership'],
      experienceYearsRequired: 5,
      educationRequirements: "Master's Degree",
      responsibilities: ['Scale distributed systems'],
      keywords: ['Distributed Systems'],
    };

    const result = MatchingEngineService.calculateMatch(sampleResume, demandingJob);

    expect(result.overallMatchScore).toBeLessThan(70);
    expect(result.missingSkills).toContain('Go');
    expect(result.missingSkills).toContain('Kubernetes');
    expect(result.missingSkills).toContain('Rust');
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some(r => r.category === 'SKILL_GAP')).toBe(true);
  });

  it('normalizes skill names correctly ignoring punctuation and whitespace', () => {
    expect(MatchingEngineService.normalizeSkillName('Node.js')).toBe('node');
    expect(MatchingEngineService.normalizeSkillName('ReactJS')).toBe('react');
    expect(MatchingEngineService.normalizeSkillName('PostgreSQL')).toBe('postgresql');
    expect(MatchingEngineService.normalizeSkillName('  Type-Script  ')).toBe('typescript');
  });
});
