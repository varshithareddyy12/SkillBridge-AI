import { getGeminiClient, isGeminiAvailable } from '../config/gemini.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface ProjectRecommendationData {
  title: string;
  problemStatement: string;
  technologies: string[];
  skillsDeveloped: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  implementationSteps: string[];
  expectedOutcome: string;
  portfolioValue: string;
}

export class ProjectService {
  /**
   * Recommend targeted practical projects that close specific skill gaps
   */
  public static async recommendProjects(
    targetRole: string,
    missingSkills: string[] = [],
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'INTERMEDIATE'
  ): Promise<ProjectRecommendationData[]> {
    if (isGeminiAvailable()) {
      try {
        const client = getGeminiClient();
        if (client) {
          const prompt = `
You are a principal software architect and engineering hiring manager.
Recommend 3 highly practical, resume-worthy software engineering projects for an engineer targeting: "${targetRole}".
Crucially, the projects MUST solve real-world problems and help the developer learn and showcase these missing skills:
${missingSkills.length ? missingSkills.join(', ') : 'Distributed systems, database optimization, cloud deployment, authentication'}.
Target difficulty: ${difficulty}.

Return ONLY a valid JSON array of objects:
[
  {
    "title": string,
    "problemStatement": string,
    "technologies": string[],
    "skillsDeveloped": string[],
    "difficulty": "${difficulty}",
    "implementationSteps": string[],
    "expectedOutcome": string,
    "portfolioValue": string
  }
]
No Markdown formatting.
`;
          const response = await client.models.generateContent({
            model: ENV.GEMINI_MODEL,
            contents: prompt,
          });

          const text = response.text?.trim() || '';
          const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as ProjectRecommendationData[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err: any) {
        logger.warn('Gemini project recommendation failed, using deterministic catalog:', err.message);
      }
    }

    return this.getDeterministicProjects(targetRole, missingSkills, difficulty);
  }

  /**
   * Deterministic project catalog tailored to missing skills
   */
  public static getDeterministicProjects(
    targetRole: string,
    missingSkills: string[],
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  ): ProjectRecommendationData[] {
    const skills = missingSkills.length > 0 ? missingSkills : ['PostgreSQL', 'Docker', 'Redis', 'TypeScript'];
    const p1Skills = skills.slice(0, 3);
    const p2Skills = skills.length > 3 ? skills.slice(2, 5) : ['REST API', 'Prisma', 'JWT Security'];

    return [
      {
        title: `Enterprise Distributed Task & Queue Orchestrator`,
        problemStatement: `Organizations often struggle with spikey workloads and heavy asynchronous jobs blocking main HTTP event loops. Build an event-driven task processing system with reliable retry policies, dead-letter queues, and live worker metrics.`,
        technologies: [...p1Skills, 'Node.js', 'Express', 'Tailwind CSS'],
        skillsDeveloped: ['Asynchronous processing', 'Database transactions', 'Graceful shutdown', 'Performance metrics'],
        difficulty: difficulty === 'BEGINNER' ? 'INTERMEDIATE' : difficulty,
        implementationSteps: [
          'Design relational schemas for job statuses, attempts, and error logs using PostgreSQL and Prisma.',
          'Implement worker concurrency control and exponential backoff retry algorithms.',
          'Build an admin observability dashboard with real-time status charts and manual retry triggers.',
          'Containerize worker nodes with Docker and configure automated integration tests.',
        ],
        expectedOutcome: 'A high-throughput worker service capable of processing 1,000+ jobs/min with full observability and fault tolerance.',
        portfolioValue: 'Demonstrates deep understanding of distributed systems, resilience engineering, and scalable backend design—a major differentiator in senior technical interviews.',
      },
      {
        title: `High-Performance Real-Time Collaboration & Analytics Suite`,
        problemStatement: `Modern web teams need real-time multi-tenant collaboration with instantaneous state synchronization and audit trails without suffering high database latency.`,
        technologies: [...p2Skills, 'TypeScript', 'React', 'PostgreSQL'],
        skillsDeveloped: ['Real-time sync', 'Optimistic UI updates', 'Relational database indexing', 'Role-based access control'],
        difficulty,
        implementationSteps: [
          'Model multi-tenant organization workspaces, member roles, and resource permissions.',
          'Implement bidirectional event streaming and conflict-resolution strategies for state mutations.',
          'Construct query optimization and index benchmarks to keep response latency below 50ms.',
          'Deploy on cloud infrastructure with automated CI/CD pipelines.',
        ],
        expectedOutcome: 'A snappy, enterprise-grade collaboration workspace with role-based access control and live audit history.',
        portfolioValue: 'Proves your capacity to build production-grade SaaS products with modern frontend ergonomics and robust relational data guarantees.',
      },
      {
        title: `Automated Cloud Observability & Security Compliance Scanner`,
        problemStatement: `Security misconfigurations and missing SSL or rate limits frequently leave production systems vulnerable. Develop an automated scanner that monitors API endpoints and logs vulnerabilities.`,
        technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
        skillsDeveloped: ['API security auditing', 'Automated scanning', 'Relational logging', 'Containerized execution'],
        difficulty: 'INTERMEDIATE',
        implementationSteps: [
          'Create automated test runners to inspect HTTP headers (CORS, CSP, HSTS, Rate Limiting).',
          'Implement scoring logic rating security posture from A+ to F based on OWASP Top 10 guidelines.',
          'Generate downloadable compliance reports in PDF/JSON format.',
        ],
        expectedOutcome: 'A fully functional security scanner with scheduled audits and automated alert notifications.',
        portfolioValue: 'Highlights proactive security awareness and systems engineering principles that engineering managers actively seek.',
      },
    ];
  }
}
