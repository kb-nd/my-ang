import { Router, Request, Response } from 'express';
import db from '../database';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Összes feladat lekérdezése
router.get('/', (req: Request, res: Response) => {
  try {
    const tasks = db.prepare(`
      SELECT t.*, u.name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `).all();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladatok lekérdezésekor' });
  }
});

// Feladat ID alapján
router.get('/:id', (req: Request, res: Response) => {
  try {
    const task = db.prepare(`
      SELECT t.*, u.name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Feladat nem található' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladat lekérdezésekor' });
  }
});

// Felhasználó feladatainak lekérdezése
router.get('/user/:userId', (req: Request, res: Response) => {
  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.params.userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladatok lekérdezésekor' });
  }
});

// Új feladat létrehozása
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, userId, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Cím kötelező' });
    }

    const result = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, user_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description || null,
      status || 'pending',
      priority || 'medium',
      userId || null,
      dueDate || null
    );

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladat létrehozásakor' });
  }
});

// Feladat frissítése
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, userId, dueDate } = req.body;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Feladat nem található' });
    }

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, user_id = ?, due_date = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      description !== undefined ? description : existing.description,
      status || existing.status,
      priority || existing.priority,
      userId !== undefined ? userId : existing.user_id,
      dueDate !== undefined ? dueDate : existing.due_date,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladat frissítésekor' });
  }
});

// Feladat törlése
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Feladat nem található' });
    }
    res.json({ message: 'Feladat törölve' });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladat törlésekor' });
  }
});

export default router;