import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../database';
import { generateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Regisztráció
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Név, email és jelszó kötelező' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Ez az email cím már foglalt' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(name, email, passwordHash, phone || null);

    const newUser = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid) as { id: number; name: string; email: string };
    const token = generateToken(newUser);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Regisztrációs hiba:', error);
    res.status(500).json({ error: 'Hiba a regisztráció során' });
  }
});

// Bejelentkezés
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email és jelszó kötelező' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: number; name: string; email: string; password_hash: string; is_active: number } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Hibás email vagy jelszó' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'A fiók deaktiválva van' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Hibás email vagy jelszó' });
    }

    const token = generateToken({ id: user.id, name: user.name, email: user.email });
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Bejelentkezési hiba:', error);
    res.status(500).json({ error: 'Hiba a bejelentkezés során' });
  }
});

// Jelenlegi felhasználó lekérdezése (token alapján)
router.get('/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nem bejelentkezve' });
  }
  res.json(req.user);
});

// Token frissítése
router.post('/refresh', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nem bejelentkezve' });
  }
  const token = generateToken(req.user);
  res.json({ token });
});

export default router;