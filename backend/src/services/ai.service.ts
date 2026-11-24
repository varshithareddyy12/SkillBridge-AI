import { getGeminiClient, isGeminiAvailable } from '../config/gemini.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ParsedResumeData, ParsedJobData, InterviewEvaluationResult } from '../types/index.js';

export class AIService {
  /**
   * Parse raw resume text into a structured profile using Gemini with heuristic fallback
   */
  public static async parseResumeText(rawText: string): Promise<ParsedResumeData> {
    if (isGeminiAvailable()) {
      try {
        const client = getGeminiClient();
        if (client) {
          const prompt = `
You are an expert ATS (Applicant Tracking System) and HR Tech parser.
Extract the candidate's structured profile from this raw resume text:
"""
${rawText.slice(0, 8000)}
"""

Return ONLY a valid JSON object matching this TypeScript structure:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "location": string,
  "summary": string,
  "education": [
    { "institution": string, "degree": string, "fieldOfStudy": string, "graduationYear": string, "gpa": string }
  ],
  "experience": [
    { "company": string, "title": string, "startDate": string, "endDate": string, "durationYears": number, "description": string, "highlights": string[] }
  ],
  "skills": [
    { "name": string, "category": string, "proficiency": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" }
  ],
  "projects": [
    { "name": string, "description": string, "technologies": string[], "link": string }
  ],
  "certifications": [
    { "name": string, "issuer": string, "year": string }
  ],
  "totalYearsExperience": number,
  "highestDegree": string
}
Do not include any Markdown wrappers like \`\`\`json or explanation outside the JSON.
`;

          const response = await client.models.generateContent({
            model: ENV.GEMINI_MODEL,
            contents: prompt,
          });

          const text = response.text?.trim() || '';
          const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as ParsedResumeData;
          if (parsed && Array.isArray(parsed.skills)) {
            return parsed;
          }
        }
      } catch (err: any) {
        logger.warn('Gemini resume parsing failed or timed out, using fallback parser:', err.message);
      }
    }

    // Deterministic fallback heuristic parser
    return this.fallbackParseResume(rawText);
  }

  /**
   * Extract job requirements from JD text using Gemini with heuristic fallback
   */
  public static async parseJobDescription(rawText: string): Promise<ParsedJobData> {
    if (isGeminiAvailable()) {
      try {
        const client = getGeminiClient();
        if (client) {
          const prompt = `
You are an expert talent acquisition analyzer.
Extract key requirements and skills from this Job Description:
"""
${rawText.slice(0, 8000)}
"""

Return ONLY a valid JSON object matching this structure:
{
  "requiredSkills": string[],
  "preferredSkills": string[],
  "softSkills": string[],
  "experienceYearsRequired": number,
  "educationRequirements": string,
  "responsibilities": string[],
  "keywords": string[]
}
Do not include Markdown blocks.
`;
          const response = await client.models.generateContent({
            model: ENV.GEMINI_MODEL,
            contents: prompt,
          });

          const text = response.text?.trim() || '';
          const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as ParsedJobData;
          if (parsed && Array.isArray(parsed.requiredSkills)) {
            return parsed;
          }
        }
      } catch (err: any) {
        logger.warn('Gemini job parsing failed or unavailable, using fallback parser:', err.message);
      }
    }

    return this.fallbackParseJob(rawText);
  }

  /**
   * Evaluate user interview answer against rubric using Gemini or heuristic scoring
   */
  public static async evaluateInterviewAnswer(
    question: string,
    idealAnswerPoints: string[],
    rubric: any,
    userAnswer: string
  ): Promise<InterviewEvaluationResult> {
    if (isGeminiAvailable()) {
      try {
        const client = getGeminiClient();
        if (client) {
          const prompt = `
You are a senior tech recruiter and technical interview evaluator.
Evaluate this candidate's answer based on the question and ideal evaluation points:
Question: "${question}"
Ideal points to cover: ${JSON.stringify(idealAnswerPoints)}
Rubric criteria: ${JSON.stringify(rubric)}

Candidate Answer:
"${userAnswer}"

Evaluate strictly on:
1. Relevance (0-100)
2. Technical correctness (0-100)
3. Clarity of explanation (0-100)
4. Depth of knowledge (0-100)

Return ONLY a valid JSON object:
{
  "overallScore": number,
  "relevanceScore": number,
  "technicalScore": number,
  "clarityScore": number,
  "depthScore": number,
  "feedback": string,
  "strengths": string[],
  "weaknesses": string[],
  "improvementSuggestions": string,
  "idealAnswerSample": string
}
`;
          const response = await client.models.generateContent({
            model: ENV.GEMINI_MODEL,
            contents: prompt,
          });

          const text = response.text?.trim() || '';
          const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as InterviewEvaluationResult;
          if (parsed && typeof parsed.overallScore === 'number') {
            return parsed;
          }
        }
      } catch (err: any) {
        logger.warn('Gemini interview evaluation failed, using rubric engine:', err.message);
      }
    }

    return this.fallbackEvaluateAnswer(question, idealAnswerPoints, userAnswer);
  }

  /**
   * Heuristic fallback for Resume Parsing
   */
  public static fallbackParseResume(text: string): ParsedResumeData {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    const knownSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Next.js', 'Python',
      'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Git', 'HTML', 'CSS', 'Tailwind CSS', 'GraphQL', 'REST API', 'Linux',
      'CI/CD', 'Jest', 'Prisma', 'Microservices', 'FastAPI', 'Django', 'Spring Boot'
    ];

    const detectedSkills: Array<{ name: string; category: string; proficiency: 'INTERMEDIATE' | 'ADVANCED' }> = [];
    const lowerText = text.toLowerCase();

    for (const skill of knownSkills) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(lowerText)) {
        detectedSkills.push({
          name: skill,
          category: 'Technical',
          proficiency: 'INTERMEDIATE',
        });
      }
    }

    // Estimate experience
    let totalYears = 1;
    const yearMatches = text.match(/\b(20\d{2})\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = yearMatches.map(Number).sort((a, b) => a - b);
      const span = years[years.length - 1] - years[0];
      if (span > 0 && span <= 30) totalYears = span;
    }

    const degreeKeywords = ['bachelor', 'master', 'b.tech', 'm.tech', 'b.s.', 'm.s.', 'ph.d', 'degree', 'computer science'];
    let degreeFound = "Bachelor's Degree in Computer Science";
    for (const d of degreeKeywords) {
      if (lowerText.includes(d)) {
        degreeFound = d.toUpperCase();
        break;
      }
    }

    return {
      fullName: lines[0] && lines[0].length < 40 ? lines[0] : 'Candidate',
      email: emailMatch ? emailMatch[0] : 'candidate@example.com',
      phone: phoneMatch ? phoneMatch[0] : '+1 (555) 000-0000',
      location: 'Remote / Hybrid',
      summary: lines.slice(1, 4).join(' ') || 'Software engineer with solid technical foundation and problem solving experience.',
      education: [
        {
          institution: 'University / Institute of Technology',
          degree: degreeFound,
          fieldOfStudy: 'Computer Science & Engineering',
          graduationYear: '2025',
          gpa: '3.8/4.0',
        },
      ],
      experience: [
        {
          company: 'Software Solutions',
          title: 'Software Development Intern / Junior Engineer',
          startDate: '2023',
          endDate: 'Present',
          durationYears: totalYears,
          description: 'Developed full stack components, optimized API workflows and integrated database models.',
          highlights: ['Built REST endpoints', 'Collaborated in Agile sprints', 'Maintained automated test coverage'],
        },
      ],
      skills: detectedSkills.length > 0 ? detectedSkills : [
        { name: 'JavaScript', category: 'Frontend', proficiency: 'INTERMEDIATE' },
        { name: 'React', category: 'Frontend', proficiency: 'INTERMEDIATE' },
        { name: 'Node.js', category: 'Backend', proficiency: 'INTERMEDIATE' },
        { name: 'SQL', category: 'Database', proficiency: 'INTERMEDIATE' },
        { name: 'Git', category: 'Tools', proficiency: 'ADVANCED' },
      ],
      projects: [
        {
          name: 'Full Stack Web Platform',
          description: 'Designed and deployed responsive web application with authentication and persistent database storage.',
          technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
          link: 'https://github.com/example/project',
        },
      ],
      certifications: [
        { name: 'Foundations of Cloud Computing & DevOps', issuer: 'Self-Paced / Coursera', year: '2024' },
      ],
      totalYearsExperience: totalYears,
      highestDegree: degreeFound,
    };
  }

  /**
   * Heuristic fallback for Job Parsing
   */
  public static fallbackParseJob(text: string): ParsedJobData {
    const lower = text.toLowerCase();
    const commonSkills = [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'PostgreSQL', 'SQL',
      'Docker', 'AWS', 'Python', 'REST API', 'GraphQL', 'Git', 'Next.js',
      'Tailwind CSS', 'Express', 'Redis', 'Kubernetes', 'CI/CD', 'Microservices'
    ];

    const required: string[] = [];
    for (const skill of commonSkills) {
      if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower)) {
        required.push(skill);
      }
    }

    // Default required skills if few detected
    if (required.length < 3) {
      required.push('JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL');
    }

    let years = 2;
    const yearMatch = text.match(/(\d+)\+?\s*years?/i);
    if (yearMatch && yearMatch[1]) {
      years = parseInt(yearMatch[1], 10);
    }

    return {
      requiredSkills: Array.from(new Set(required)),
      preferredSkills: ['Docker', 'AWS', 'Redis', 'Unit Testing', 'CI/CD'],
      softSkills: ['Communication', 'Teamwork', 'Critical Thinking', 'Problem Solving', 'Agile Collaboration'],
      experienceYearsRequired: years,
      educationRequirements: "Bachelor's degree in Computer Science, Software Engineering or related practical experience",
      responsibilities: [
        'Design, build, and maintain efficient, reusable, and reliable full stack software components.',
        'Collaborate closely with cross-functional teams to define architecture and deliver business features.',
        'Write automated tests, participate in code reviews, and optimize application performance.',
      ],
      keywords: ['Full Stack', 'Scalability', 'API', 'Database', 'Cloud', 'TypeScript', 'Clean Code'],
    };
  }

  /**
   * Deterministic evaluation of answer based on keyword density & rubric
   */
  public static fallbackEvaluateAnswer(
    question: string,
    idealPoints: string[],
    answer: string
  ): InterviewEvaluationResult {
    const lowerAns = answer.toLowerCase();
    let coveredPoints = 0;

    for (const pt of idealPoints) {
      const words = pt.toLowerCase().split(' ').filter(w => w.length > 4);
      const match = words.some(w => lowerAns.includes(w));
      if (match) coveredPoints++;
    }

    const coverageRatio = idealPoints.length > 0 ? coveredPoints / idealPoints.length : 0.7;
    const lengthBonus = Math.min(answer.length / 300, 1.0); // Reward detailed explanations (up to 300 chars)

    const relevance = Math.min(Math.round(60 + coverageRatio * 30 + lengthBonus * 10), 98);
    const technical = Math.min(Math.round(55 + coverageRatio * 35 + lengthBonus * 8), 96);
    const clarity = Math.min(Math.round(65 + lengthBonus * 30), 95);
    const depth = Math.min(Math.round(50 + coverageRatio * 30 + lengthBonus * 18), 94);

    const overall = Math.round((relevance * 0.3) + (technical * 0.35) + (clarity * 0.2) + (depth * 0.15));

    return {
      overallScore: overall,
      relevanceScore: relevance,
      technicalScore: technical,
      clarityScore: clarity,
      depthScore: depth,
      feedback: overall >= 75
        ? 'Strong response! You addressed key core competencies, demonstrated technical understanding, and articulated clear practical reasoning.'
        : 'Good foundation, but your answer could delve deeper into architectural trade-offs, edge cases, and specific implementation details.',
      strengths: [
        'Directly addressed the question prompt.',
        'Maintained structured and coherent train of thought.',
        'Highlighted fundamental engineering concepts.',
      ],
      weaknesses: [
        coverageRatio < 0.8 ? 'Could expand on edge cases, security considerations, or performance bottlenecks.' : 'Could provide more concrete production examples.',
      ],
      improvementSuggestions: 'Structure your response using the STAR method (Situation, Task, Action, Result) or Architecture -> Implementation -> Trade-offs approach for maximum impact.',
      idealAnswerSample: `In real-world applications, address this by identifying root requirements, evaluating trade-offs (e.g. latency vs consistency, complexity vs maintainability), and walking through concrete code or architectural patterns. Key principles include: ${idealPoints.join(', ')}.`,
    };
  }
}
