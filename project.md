# Projekt összefoglaló

## Technológiai stack
- **Frontend:** Angular 22, Angular Material 22, TypeScript 6
- **Backend:** Express 5, tsx
- **Adatbázis:** SQLite (better-sqlite3)
- **Hitelesítés:** JWT (jsonwebtoken, bcrypt)
- **Téma:** Angular Material sötét téma (azure + blue paletta)

## Projekt struktúra

```
my-ang/
├── server/                     # Backend
│   ├── index.ts                # Express szerver indítás
│   ├── database.ts             # SQLite DB, séma, seed adatok
│   ├── middleware/
│   │   └── auth.ts             # JWT middleware, token generálás/ellenőrzés
│   └── routes/
│       ├── auth.ts             # /api/auth/login, /api/auth/register
│       ├── users.ts            # /api/users CRUD + /me/profile, /me/password, /me/account
│       └── tasks.ts            # /api/tasks CRUD
│
├── src/app/
│   ├── app.ts                  # Gyökér komponens (mat-toolbar)
│   ├── app.routes.ts           # Útvonalak (lazy loading + guard-ok)
│   ├── app.config.ts           # Provider-ok (router, http, animations, interceptors)
│   ├── guards/
│   │   └── auth.guard.ts       # authGuard, guestGuard
│   ├── models/
│   │   ├── user.model.ts       # User interfész
│   │   └── task.model.ts       # Task interfész
│   ├── services/
│   │   ├── auth.service.ts     # JWT autentikációs szolgáltatás (signal-okkal)
│   │   ├── auth.interceptor.ts # HTTP interceptor (Bearer token)
│   │   ├── user.service.ts     # Felhasználói API hívások
│   │   └── task.service.ts     # Feladat API hívások
│   └── components/
│       ├── auth/
│       │   ├── login/          # Bejelentkezési űrlap
│       │   ├── register/       # Regisztrációs űrlap
│       │   └── profile/        # Profil kezelés (3 fül)
│       ├── users/
│       │   ├── user-list/      # Felhasználó lista (mat-table)
│       │   └── user-detail/    # Felhasználó szerkesztése/új létrehozása
│       └── tasks/
│           ├── task-list/      # Feladat lista (mat-table)
│           └── task-detail/    # Feladat szerkesztése/új létrehozása
│
├── data/
│   └── database.sqlite         # SQLite adatbázis fájl
├── proxy.conf.json             # Proxy: /api → localhost:3000
└── styles.scss                 # Globális stílusok, Material téma
```

## Adatbázis séma

### users tábla
| Oszlop         | Típus   | Leírás                        |
|---------------|---------|-------------------------------|
| id            | INTEGER | Elsődleges kulcs              |
| name          | TEXT    | Felhasználó neve              |
| email         | TEXT    | Egyedi email cím              |
| password_hash | TEXT    | bcrypt jelszó hash            |
| phone         | TEXT    | Telefonszám (opcionális)      |
| is_active     | INTEGER | Aktív státusz (0/1)           |
| created_at    | TEXT    | Létrehozás időpontja          |

### tasks tábla
| Oszlop      | Típus   | Leírás                              |
|------------|---------|-------------------------------------|
| id         | INTEGER | Elsődleges kulcs                    |
| title      | TEXT    | Feladat címe                        |
| description| TEXT    | Leírás (opcionális)                 |
| status     | TEXT    | pending / in-progress / completed   |
| priority   | TEXT    | low / medium / high                 |
| user_id    | INTEGER | Külső kulcs a users táblára         |
| due_date   | TEXT    | Határidő (opcionális)               |
| created_at | TEXT    | Létrehozás időpontja                |

## API végpontok

### Autentikáció
- `POST /api/auth/login` - Bejelentkezés (email + jelszó)
- `POST /api/auth/register` - Regisztráció (name, email, phone, password)

### Felhasználók (JWT védett)
- `GET /api/users` - Összes felhasználó lekérése
- `GET /api/users/:id` - Egy felhasználó lekérése
- `POST /api/users` - Új felhasználó létrehozása
- `PUT /api/users/:id` - Felhasználó adatainak frissítése
- `DELETE /api/users/:id` - Felhasználó törlése
- `PUT /api/users/me/profile` - saját profil frissítése
- `PUT /api/users/me/password` - saját jelszó módosítása
- `DELETE /api/users/me/account` - saját fiók törlése

### Feladatok (JWT védett)
- `GET /api/tasks` - Összes feladat lekérése
- `GET /api/tasks/:id` - Egy feladat lekérése
- `POST /api/tasks` - Új feladat létrehozása
- `PUT /api/tasks/:id` - Feladat frissítése
- `DELETE /api/tasks/:id` - Feladat törlése

## Útvonalak (Frontend)
- `/login` - Bejelentkezés (guestGuard)
- `/register` - Regisztráció (guestGuard)
- `/profile` - Profil kezelés (authGuard)
- `/users` - Felhasználó lista (authGuard)
- `/users/:id` - Felhasználó szerkesztése (authGuard)
- `/tasks` - Feladat lista (authGuard)
- `/tasks/:id` - Feladat szerkesztése (authGuard)

## Seed adatok
Alapértelmezett jelszó: `password123` (mindhárom felhasználóhoz)

| Név            | Email                        | Státusz  |
|---------------|------------------------------|----------|
| Kovács János  | kovacs.janos@example.com     | Aktív    |
| Nagy Anna     | nagy.anna@example.com        | Aktív    |
| Szabó Péter   | szabo.peter@example.com      | Inaktív  |

## Főbb jellemzők
- **JWT hitelesítés** - Bearer token-alapú autentikáció
- **Signal-alapú állapotkezelés** - Angular signals a state management-hez
- **Lazy loading** - Minden komponens betöltésre kerül csak akkor, amikor szükséges
- **Route guard-ok** - authGuard (védett), guestGuard (csak vendég)
- **Angular Material** - Sötét téma, mat-table, mat-card, mat-form-field
- **Hover effektek** - Világosítás mezőkre és sorokra rámutatáskor
- **Proxy** - Frontend proxyzás a backend API-hoz

## Indítás
```bash
npm start    # Szerver + kliens egyidejű indítása
```

## Demo fiókok
- `kovacs.janos@example.com` / `password123`
- `nagy.anna@example.com` / `password123`
- `szabo.peter@example.com` / `password123`