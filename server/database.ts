import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');

// Adatbázis könyvtár létrehozása
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// WAL mód engedélyezése a jobb teljesítményhez
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Táblák létrehozása
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    user_id INTEGER,
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

// Seed data - csak ha üres az adatbázis
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, is_active, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, user_id, due_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Tranzakció a seed adatok beszúrásához
  const seedData = db.transaction(() => {
    insertUser.run('Kovács János', 'kovacs.janos@example.com', '+36 30 123 4567', 1, '2024-01-15');
    insertUser.run('Nagy Anna', 'nagy.anna@example.com', '+36 20 987 6543', 1, '2024-02-20');
    insertUser.run('Szabó Péter', 'szabo.peter@example.com', null, 0, '2024-03-10');

    insertTask.run('Projekt tervezés', 'Az új projekt követelményeinek kidolgozása', 'completed', 'high', 1, '2024-04-01', '2024-03-15');
    insertTask.run('Kód review', 'A fejlesztői ág kódjának áttekintése', 'in-progress', 'medium', 2, '2024-04-10', '2024-03-20');
    insertTask.run('Hibajavítás', '#1234-es hiba kijavítása a bejelentkezési folyamatban', 'pending', 'high', 1, '2024-04-05', '2024-03-25');
    insertTask.run('Dokumentáció frissítése', 'API dokumentáció frissítése az új végpontokkal', 'pending', 'low', 3, null, '2024-03-28');
  });

  seedData();
}

export default db;