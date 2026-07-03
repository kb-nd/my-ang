import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string };
}

export const generateToken = (user: { id: number; email: string; name: string }): string => {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { id: number; email: string; name: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
  } catch {
    return null;
  }
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Hitelesítés szükséges' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Érvénytelen vagy lejárt token' });
    return;
  }

  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ? AND is_active = 1').get(decoded.id);
  
  if (!user) {
    res.status(401).json({ error: 'Felhasználó nem található vagy inaktív' });
    return;
  }

  req.user = user as { id: number; email: string; name: string };
  next();
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (decoded) {
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ? AND is_active = 1').get(decoded.id);
    if (user) {
      req.user = user as { id: number; email: string; name: string };
    }
  }
  
  next();
};