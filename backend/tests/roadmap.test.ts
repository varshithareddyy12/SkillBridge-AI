import { describe, it, expect } from 'vitest';
import { RoadmapService } from '../src/services/roadmap.service.js';

describe('Roadmap Service', () => {
  it('generates a deterministic 60-day roadmap with 4 structured milestones', () => {
    const roadmap = RoadmapService.generateDeterministicRoadmap(
      'Senior Backend Engineer',
      60,
      ['PostgreSQL', 'Docker', 'Kubernetes', 'Redis']
    );

    expect(roadmap.durationDays).toBe(60);
    expect(roadmap.targetRole).toBe('Senior Backend Engineer');
    expect(roadmap.milestones.length).toBe(4);
    expect(roadmap.milestones[0].topics.length).toBeGreaterThan(0);
    expect(roadmap.milestones[0].resources.length).toBeGreaterThan(0);
    expect(roadmap.milestones[0].projects.length).toBeGreaterThan(0);
  });

  it('adjusts estimated days proportionally for 30 and 90 day roadmaps', () => {
    const roadmap30 = RoadmapService.generateDeterministicRoadmap('Frontend Specialist', 30, ['Tailwind']);
    const roadmap90 = RoadmapService.generateDeterministicRoadmap('AI Engineer', 90, ['Python']);

    expect(roadmap30.milestones[0].estimatedDays).toBeLessThan(roadmap90.milestones[0].estimatedDays);
  });
});
