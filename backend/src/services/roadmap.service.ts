import { getGeminiClient, isGeminiAvailable } from '../config/gemini.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface MilestoneData {
  title: string;
  description: string;
  orderIndex: number;
  estimatedDays: number;
  topics: string[];
  resources: Array<{ title: string; url: string; type: string }>;
  projects: Array<{ title: string; description: string }>;
}

export interface GeneratedRoadmapPlan {
  title: string;
  targetRole: string;
  durationDays: number;
  overview: string;
  milestones: MilestoneData[];
}

export class RoadmapService {
  /**
   * Generate a structured career roadmap tailored to role, duration and target skills
   */
  public static async generateRoadmap(
    targetRole: string,
    durationDays: number = 60,
    skillGaps: string[] = []
  ): Promise<GeneratedRoadmapPlan> {
    if (isGeminiAvailable()) {
      try {
        const client = getGeminiClient();
        if (client) {
          const prompt = `
You are a senior technical career coach.
Create a high-impact, realistic ${durationDays}-day personalized learning roadmap for a developer aiming for the role of "${targetRole}".
Key skill gaps to address: ${skillGaps.length ? skillGaps.join(', ') : 'Modern full stack, cloud, and system design'}.

Return ONLY a valid JSON object matching this schema:
{
  "title": "${durationDays}-Day Mastery Plan for ${targetRole}",
  "targetRole": "${targetRole}",
  "durationDays": ${durationDays},
  "overview": string,
  "milestones": [
    {
      "title": string,
      "description": string,
      "orderIndex": number,
      "estimatedDays": number,
      "topics": string[],
      "resources": [{ "title": string, "url": string, "type": "Documentation" | "Tutorial" | "Video" | "Course" }],
      "projects": [{ "title": string, "description": string }]
    }
  ]
}
Generate between 4 to 6 sequential milestones tailored to fit ${durationDays} days.
`;
          const response = await client.models.generateContent({
            model: ENV.GEMINI_MODEL,
            contents: prompt,
          });

          const text = response.text?.trim() || '';
          const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as GeneratedRoadmapPlan;
          if (parsed && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
            return parsed;
          }
        }
      } catch (err: any) {
        logger.warn('Gemini roadmap generation failed, generating deterministic fallback:', err.message);
      }
    }

    return this.generateDeterministicRoadmap(targetRole, durationDays, skillGaps);
  }

  /**
   * Deterministic roadmap generation for any role and duration
   */
  public static generateDeterministicRoadmap(
    targetRole: string,
    durationDays: number,
    skillGaps: string[]
  ): GeneratedRoadmapPlan {
    const focus = skillGaps.length > 0 ? skillGaps : ['Architecture & State', 'Database Design & Optimization', 'API Security & Testing', 'Production Deployment'];
    const daysPerMilestone = Math.max(7, Math.floor(durationDays / 4));

    const milestones: MilestoneData[] = [
      {
        title: `Phase 1: Core Fundamentals & ${focus[0] || 'Modern Architecture'}`,
        description: `Establish rock-solid understanding of core patterns, typed contracts, and architectural paradigms required for ${targetRole}.`,
        orderIndex: 1,
        estimatedDays: daysPerMilestone,
        topics: [
          `Deep dive into ${focus[0] || 'TypeScript & Clean Architecture'}`,
          'State management and immutable data flow patterns',
          'Component lifecycle and performance profiling',
          'Error boundaries and structured exception handling',
        ],
        resources: [
          { title: 'Official Documentation & Standards', url: 'https://developer.mozilla.org', type: 'Documentation' },
          { title: 'Architecture Patterns Guide', url: 'https://patterns.dev', type: 'Tutorial' },
        ],
        projects: [
          { title: 'Architectural Proof-of-Concept', description: 'Build an isolated module enforcing strict types, validation, and modular decoupling.' },
        ],
      },
      {
        title: `Phase 2: Data Persistence & ${focus[1] || 'Backend Scalability'}`,
        description: `Implement scalable persistence layers, relational schemas, caching, and resilient API contracts.`,
        orderIndex: 2,
        estimatedDays: daysPerMilestone,
        topics: [
          `Database modeling with ${focus[1] || 'PostgreSQL & Prisma ORM'}`,
          'Indexing strategies, query optimization, and connection pooling',
          'JWT authentication, RBAC authorization, and token refresh workflows',
          'Input validation, sanitization, and defensive API design',
        ],
        resources: [
          { title: 'PostgreSQL Tutorial & Indexing Deep-Dive', url: 'https://postgresqltutorial.com', type: 'Documentation' },
          { title: 'Prisma Data Modeling Best Practices', url: 'https://prisma.io/docs', type: 'Documentation' },
        ],
        projects: [
          { title: 'Resilient Micro-Service or API Gateway', description: 'Develop a fully typed REST service with Prisma ORM, migrations, and rate limiting.' },
        ],
      },
      {
        title: `Phase 3: Integration, Testing & ${focus[2] || 'System Design'}`,
        description: `Elevate code quality with automated unit/integration tests and production-ready system design practices.`,
        orderIndex: 3,
        estimatedDays: daysPerMilestone,
        topics: [
          'End-to-end and unit testing with Vitest or Jest',
          'Containerization with Docker & Multi-stage builds',
          'Caching with Redis and background asynchronous job queues',
          'Mock interview simulations and technical problem solving',
        ],
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'Course' },
          { title: 'Docker Official Guides', url: 'https://docs.docker.com', type: 'Documentation' },
        ],
        projects: [
          { title: 'Full-Stack Integration Suite', description: 'Configure automated CI pipelines running unit tests, linting, and build verification.' },
        ],
      },
      {
        title: `Phase 4: Capstone Portfolio Deployment & ${focus[3] || 'Cloud Readiness'}`,
        description: `Ship a production-grade portfolio application showcasing your skills to hiring managers with real metrics.`,
        orderIndex: 4,
        estimatedDays: daysPerMilestone,
        topics: [
          'Cloud deployment (Render, Vercel, Aiven PostgreSQL, AWS)',
          'Monitoring, health-check endpoints, and structured application logging',
          'Performance audits with Lighthouse (Core Web Vitals)',
          'Resume optimization and behavioral interview preparation',
        ],
        resources: [
          { title: 'Web Vitals & Performance Optimization', url: 'https://web.dev/vitals', type: 'Tutorial' },
          { title: 'Production Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', type: 'Guide' },
        ],
        projects: [
          { title: 'SkillBridge Showcase Project', description: 'Deploy your complete production application with SSL, live database, and documentation.' },
        ],
      },
    ];

    return {
      title: `${durationDays}-Day Career Roadmap: ${targetRole}`,
      targetRole,
      durationDays,
      overview: `A structured ${durationDays}-day curriculum meticulously engineered to bridge your specific skill gaps and prepare you for high-level technical interviews as a ${targetRole}.`,
      milestones,
    };
  }
}
