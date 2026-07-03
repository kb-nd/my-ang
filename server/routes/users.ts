import { Router, Request, Response } from 'express';
import db from '../database';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Összes felhasználó lekérdezése
router.get('/', (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, name, email, phone, is_active, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a felhasználók lekérdezésekor' });
  }
});

// Felhasználó ID alapján
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, is_active, created_at FROM users WHERE id = ?').get(req.params.id);
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
    const { name, email, phone, is_active } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Név és email kötelező' });
    }

    const result = db.prepare(`
      INSERT INTO users (name, email, phone, is_active)
      VALUES (?, ?, ?, ?)
    `).run(name, email, phone || null, is_active !== undefined ? (is_active ? 1 : 0) : 1);

    const newUser = db.prepare('SELECT id, name, email, phone, is_active, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
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
    const { name, email, phone, is_active } = req.body;
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    if (email && email !== existing.email) {
      const emailExists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
      if (emailExists) {
        return res.status(400).json({ error: 'Ez az email cím már foglalt' });
      }
    }

    db.prepare(`
      UPDATE users SET name = ?, email = ?, phone = ?, is_active = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      email || existing.email,
      phone !== undefined ? phone : existing.phone,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT id, name, email, phone, is_active, created_at FROM users WHERE id = ?').get(req.params.id);
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

// Felhasználó jelszavának beállítása
router.put('/:id/password', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Jelszó kötelező' });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.params.id);

    res.json({ message: 'Jelszó sikeresen beállítva' });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a jelszó beállításakor' });
  }
});

// === Auth-védelt végpontok (saját profil) ===

// Jelenlegi felhasználó profiljának lekérdezése
router.get('/me/profile', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nem bejelentkezve' });
    }
    const user = db.prepare('SELECT id, name, email, phone, is_active, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a felhasználó lekérdezésekor' });
  }
});

// Saját profil frissítése
router.put('/me/profile', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nem bejelentkezve' });
    }

    const { name, email, phone } = req.body;
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    if (email && email !== existing.email) {
      const emailExists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
      if (emailExists) {
        return res.status(400).json({ error: 'Ez az email cím már foglalt' });
      }
    }

    db.prepare(`
      UPDATE users SET name = ?, email = ?, phone = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      email || existing.email,
      phone !== undefined ? phone : existing.phone,
      req.user.id
    );

    const updated = db.prepare('SELECT id, name, email, phone, is_active, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(updated);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ez az email cím már foglalt' });
    }
    res.status(500).json({ error: 'Hiba a felhasználó frissítésekor' });
  }
});

// Jelszó változtatása
router.put('/me/password', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nem bejelentkezve' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Jelenlegi és új jelszó kötelező' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as { password_hash: string } | undefined;
    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const bcrypt = require('bcrypt');
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Hibás jelenlegi jelszó' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, req.user.id);

    res.json({ message: 'Jelszó sikeresen megváltoztatva' });
  } catch (error) {
    console.error('Jelszó változtatási hiba:', error);
    res.status(500).json({ error: 'Hiba a jelszó változtatásakor' });
  }
});

// Saját fiók törlése
router.delete('/me/account', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nem bejelentkezve' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json({ message: 'Fiók törölve' });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a fiók törlésekor' });
  }
});

export default router;