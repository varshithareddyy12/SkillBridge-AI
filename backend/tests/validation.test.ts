import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createJobSchema,
  runMatchSchema,
  createRoadmapSchema,
} from '../src/validators/schemas.js';

describe('Validation Schemas', () => {
  it('validates correct registration payloads', () => {
    const valid = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      experienceLevel: 'ENTRY',
    };
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid email and short password in registration', () => {
    const invalid = {
      email: 'not-an-email',
      password: '123',
      fullName: 'J',
    };
    expect(() => registerSchema.parse(invalid)).toThrow();
  });

  it('validates roadmap duration must be 30, 60, or 90 days', () => {
    expect(() => createRoadmapSchema.parse({ targetRole: 'Dev', durationDays: 60 })).not.toThrow();
    expect(() => createRoadmapSchema.parse({ targetRole: 'Dev', durationDays: 45 })).toThrow();
  });

  it('requires UUID for match analysis', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(() =>
      runMatchSchema.parse({ resumeId: validUuid, jobDescriptionId: validUuid })
    ).not.toThrow();

    expect(() =>
      runMatchSchema.parse({ resumeId: 'invalid-id', jobDescriptionId: '123' })
    ).toThrow();
  });
});
