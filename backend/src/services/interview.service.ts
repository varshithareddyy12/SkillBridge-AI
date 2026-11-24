import { getGeminiClient, isGeminiAvailable } from '../config/gemini.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AIService } from './ai.service.js';
import { InterviewEvaluationResult } from '../types/index.js';

export interface GeneratedQuestionItem {
  questionText: string;
  orderIndex: number;
  idealAnswerPoints: string[];
  rubric: {
    relevanceWeight: number;
    technicalWeight: number;
    clarityWeight: number;
    depthWeight: number;
  };
}

export class InterviewService {
  /**
   * Generate interview questions tailored to category, target role, and difficulty
   */
  public static async generateQuestions(
    category: 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'ROLE_SPECIFIC' | 'PROJECT_BASED',
    targetRole: string,
    difficulty: 'ENTRY' | 'MID' | 'SENIOR',
    count: number = 5
  ): Promise<GeneratedQuestionItem[]> {
    if (isGeminiAvailable()) {
      try {
        const client = getGeminiClient();
        if (client) {
          const prompt = `
You are a senior tech hiring manager conducting a ${category} interview for a ${difficulty} level "${targetRole}".
Generate ${count} insightful, realistic interview questions.
For each question, specify the ideal answer points to look for and rubric weights.

Return ONLY a valid JSON array:
[
  {
    "questionText": string,
    "orderIndex": number,
    "idealAnswerPoints": string[],
    "rubric": {
      "relevanceWeight": 0.3,
      "technicalWeight": 0.35,
      "clarityWeight": 0.2,
      "depthWeight": 0.15
    }
  }
]
`;
          const response = await client.models.generateContent({
            model: ENV.GEMINI_MODEL,
            contents: prompt,
          });

          const text = response.text?.trim() || '';
          const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as GeneratedQuestionItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => ({
              ...item,
              orderIndex: idx + 1,
            }));
          }
        }
      } catch (err: any) {
        logger.warn('Gemini question generation failed, using question bank fallback:', err.message);
      }
    }

    return this.getFallbackQuestions(category, targetRole, difficulty, count);
  }

  /**
   * Evaluate a candidate's answer against the question's rubric
   */
  public static async evaluateAnswer(
    questionText: string,
    idealAnswerPoints: string[],
    rubric: any,
    userAnswer: string
  ): Promise<InterviewEvaluationResult> {
    return AIService.evaluateInterviewAnswer(questionText, idealAnswerPoints, rubric, userAnswer);
  }

  /**
   * Fallback Question Bank covering all 5 categories and difficulty levels
   */
  public static getFallbackQuestions(
    category: string,
    role: string,
    difficulty: string,
    count: number
  ): GeneratedQuestionItem[] {
    const questionBanks: Record<string, GeneratedQuestionItem[]> = {
      TECHNICAL: [
        {
          questionText: `Explain how indexing works in a relational database like PostgreSQL. When would an index degrade performance instead of improving it?`,
          orderIndex: 1,
          idealAnswerPoints: [
            'B-Tree data structures and search complexity O(log N)',
            'Trade-off: read speed vs write latency on INSERT/UPDATE/DELETE',
            'Index maintenance overhead and disk storage footprint',
            'Low-cardinality columns where sequential scans are preferred by query planner',
          ],
          rubric: { relevanceWeight: 0.3, technicalWeight: 0.35, clarityWeight: 0.2, depthWeight: 0.15 },
        },
        {
          questionText: `How does Node.js handle asynchronous concurrency with a single-threaded event loop? What happens if you run a CPU-intensive loop?`,
          orderIndex: 2,
          idealAnswerPoints: [
            'V8 engine and Libuv thread pool interaction',
            'Phases of the event loop: timers, I/O callbacks, poll, check, close',
            'Blocking the event loop stalls all concurrent incoming HTTP requests',
            'Mitigation strategies: worker threads, child processes, or offloading to background worker queues',
          ],
          rubric: { relevanceWeight: 0.3, technicalWeight: 0.35, clarityWeight: 0.2, depthWeight: 0.15 },
        },
        {
          questionText: `Describe the difference between state management using React hooks (useState/useReducer) and global stores (Zustand/Redux). When do you switch?`,
          orderIndex: 3,
          idealAnswerPoints: [
            'Prop drilling and component coupling issues',
            'Unnecessary re-renders and React reconciliation performance',
            'Shared multi-component cross-cutting state (e.g., auth, shopping cart, theme)',
            'Server-side state caching (React Query) vs client-side UI state',
          ],
          rubric: { relevanceWeight: 0.3, technicalWeight: 0.35, clarityWeight: 0.2, depthWeight: 0.15 },
        },
        {
          questionText: `What are the primary differences between SQL and NoSQL databases, and how do ACID guarantees factor into your choice?`,
          orderIndex: 4,
          idealAnswerPoints: [
            'Schema enforcement vs flexible document/key-value structure',
            'ACID transactions (Atomicity, Consistency, Isolation, Durability) vs BASE model',
            'Horizontal vs vertical scaling strategies',
            'Use cases: complex joins & transactional consistency vs high-write throughput and schemaless logs',
          ],
          rubric: { relevanceWeight: 0.3, technicalWeight: 0.35, clarityWeight: 0.2, depthWeight: 0.15 },
        },
        {
          questionText: `How do you secure a RESTful API? Outline authentication, authorization, and protection against common attacks like injection and CSRF.`,
          orderIndex: 5,
          idealAnswerPoints: [
            'Stateless JWT vs session cookies with HttpOnly and SameSite flags',
            'Parameterized queries and ORM validation to prevent SQL injection',
            'CORS whitelist configuration and Helmet security headers',
            'Rate limiting to prevent brute-force attacks and DDoS',
          ],
          rubric: { relevanceWeight: 0.3, technicalWeight: 0.35, clarityWeight: 0.2, depthWeight: 0.15 },
        },
      ],
      BEHAVIORAL: [
        {
          questionText: `Tell me about a time when you had to work with a team member who had a strongly conflicting opinion on how to architect a solution. How did you resolve it?`,
          orderIndex: 1,
          idealAnswerPoints: [
            'Objective evaluation criteria rather than emotional argumentation',
            'Prototyping benchmarks or gathering quantitative data',
            'Active listening and seeking compromise aligned with business requirements',
            'Successful outcome and continued healthy collaboration',
          ],
          rubric: { relevanceWeight: 0.35, technicalWeight: 0.15, clarityWeight: 0.3, depthWeight: 0.2 },
        },
        {
          questionText: `Describe a situation where a critical production bug or unexpected regression occurred under tight deadlines. How did you handle the pressure?`,
          orderIndex: 2,
          idealAnswerPoints: [
            'Calm triage, isolating the blast radius, and rolling back or applying hotfix',
            'Transparent communication with stakeholders',
            'Root cause analysis (5 Whys methodology)',
            'Implementation of regression tests to permanently prevent recurrence',
          ],
          rubric: { relevanceWeight: 0.35, technicalWeight: 0.15, clarityWeight: 0.3, depthWeight: 0.2 },
        },
        {
          questionText: `Can you share an instance where you had to quickly learn an unfamiliar technology or framework to deliver a feature on time?`,
          orderIndex: 3,
          idealAnswerPoints: [
            'Methodical learning approach: reading official docs, building spike experiments',
            'Seeking guidance from experienced team members without being completely dependent',
            'Delivering on schedule while maintaining clean code standards',
            'Knowledge sharing with the wider team afterwards',
          ],
          rubric: { relevanceWeight: 0.35, technicalWeight: 0.15, clarityWeight: 0.3, depthWeight: 0.2 },
        },
      ],
      HR: [
        {
          questionText: `Why are you interested in becoming a ${role}, and what makes your background a strong fit for this journey?`,
          orderIndex: 1,
          idealAnswerPoints: [
            'Clear passion for technical problem solving and impact',
            'Concrete alignment between past projects and target industry',
            'Self-awareness regarding personal strengths and growth areas',
            'Enthusiasm for team culture and continuous learning',
          ],
          rubric: { relevanceWeight: 0.4, technicalWeight: 0.1, clarityWeight: 0.3, depthWeight: 0.2 },
        },
        {
          questionText: `Where do you see your engineering career evolving in the next 2 to 3 years?`,
          orderIndex: 2,
          idealAnswerPoints: [
            'Commitment to deepening architectural mastery and domain expertise',
            'Interest in mentoring junior peers and improving system reliability',
            'Realistic, structured milestones aligned with professional growth',
          ],
          rubric: { relevanceWeight: 0.4, technicalWeight: 0.1, clarityWeight: 0.3, depthWeight: 0.2 },
        },
      ],
      ROLE_SPECIFIC: [
        {
          questionText: `As a ${role}, how do you balance the trade-off between shipping features rapidly to meet product deadlines versus writing comprehensive tests and refactoring technical debt?`,
          orderIndex: 1,
          idealAnswerPoints: [
            'Pragmatic prioritization: identifying core business risks vs secondary features',
            'Defensive testing on critical financial or transactional pathways',
            'Tracking technical debt explicitly in backlog with clear payoff milestones',
            'Maintaining clean interfaces so implementations can be refactored incrementally',
          ],
          rubric: { relevanceWeight: 0.3, technicalWeight: 0.3, clarityWeight: 0.2, depthWeight: 0.2 },
        },
      ],
      PROJECT_BASED: [
        {
          questionText: `Walk me through the most technically challenging project you have built. What was the core architectural bottleneck, and how did you resolve it?`,
          orderIndex: 1,
          idealAnswerPoints: [
            'Clear problem statement and technical stack justification',
            'Concrete bottleneck (e.g. slow query latency, race conditions, memory leak, sync state)',
            'Measuring before and after metrics (e.g., response time reduced from 400ms to 45ms)',
            'Lessons learned and what you would do differently in hindsight',
          ],
          rubric: { relevanceWeight: 0.25, technicalWeight: 0.4, clarityWeight: 0.2, depthWeight: 0.15 },
        },
      ],
    };

    const categoryQuestions = questionBanks[category] || questionBanks.TECHNICAL;
    return categoryQuestions.slice(0, count);
  }
}
