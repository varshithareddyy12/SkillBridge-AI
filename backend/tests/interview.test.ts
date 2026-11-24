import { describe, it, expect } from 'vitest';
import { AIService } from '../src/services/ai.service.js';

describe('AI Interview Studio Rubric Evaluation', () => {
  const question = 'How does indexing work in PostgreSQL and when should you avoid it?';
  const idealPoints = [
    'B-Tree data structures',
    'Trade-off on write operations',
    'Index maintenance overhead',
    'Low cardinality columns',
  ];

  it('evaluates relevant and detailed technical answers favorably', () => {
    const detailedAnswer = `PostgreSQL indexes primarily use B-Tree structures to achieve O(log N) search complexity. However, on every INSERT and UPDATE, the database must maintain the index overhead, degrading write performance. You should avoid indexes on low cardinality columns where sequential scans are faster.`;

    const result = AIService.fallbackEvaluateAnswer(question, idealPoints, detailedAnswer);

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.relevanceScore).toBeGreaterThanOrEqual(70);
    expect(result.technicalScore).toBeGreaterThanOrEqual(70);
    expect(result.feedback).toBeTruthy();
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('provides constructive feedback and lower scores for brief or incomplete answers', () => {
    const poorAnswer = 'Indexes make searches faster.';

    const result = AIService.fallbackEvaluateAnswer(question, idealPoints, poorAnswer);

    expect(result.overallScore).toBeLessThan(75);
    expect(result.weaknesses.length).toBeGreaterThan(0);
    expect(result.improvementSuggestions).toContain('STAR method');
  });
});
