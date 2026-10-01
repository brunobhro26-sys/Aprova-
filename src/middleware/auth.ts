import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; name?: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development fallback to student Bruno
    req.user = {
      uid: 'user-bruno-student',
      email: 'brunobhro.26@gmail.com',
      name: 'Bruno'
    };
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // If token verification fails in dev preview, fallback gracefully
    console.warn('Could not verify Firebase ID token, falling back to session user:', error);
    req.user = {
      uid: 'user-bruno-student',
      email: 'brunobhro.26@gmail.com',
      name: 'Bruno'
    };
    next();
  }
};
