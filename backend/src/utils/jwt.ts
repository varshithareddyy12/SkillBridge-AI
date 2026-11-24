import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { JWTPayload } from '../types/index.js';

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
}
