import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

// Összes felhasználó lekérdezése
router.get('/', (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a felhasználók lekérdezésekor' });
  }
});

// Felhasználó ID alapján
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a felhasználó lekérdezésekor' });
  }
});

// Új felhasználó létrehozása
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, isActive } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Név és email kötelező' });
    }

    const result = db.prepare(`
      INSERT INTO users (name, email, phone, is_active)
      VALUES (?, ?, ?, ?)
    `).run(name, email, phone || null, isActive ? 1 : 0);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ez az email cím már foglalt' });
    }
    res.status(500).json({ error: 'Hiba a felhasználó létrehozásakor' });
  }
});

// Felhasználó frissítése
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    db.prepare(`
      UPDATE users SET name = ?, email = ?, phone = ?, is_active = ?
      WHERE id = ?
    `).run(
      name || (existing as any).name,
      email || (existing as any).email,
      phone !== undefined ? phone : (existing as any).phone,
      isActive !== undefined ? (isActive ? 1 : 0) : (existing as any).is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ez az email cím már foglalt' });
    }
    res.status(500).json({ error: 'Hiba a felhasználó frissítésekor' });
  }
});

// Felhasználó törlése
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json({ message: 'Felhasználó törölve' });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a felhasználó törlésekor' });
  }
});

export default router;