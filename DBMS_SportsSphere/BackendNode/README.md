# SportsSphere Node Backend

This is the Express + Prisma replacement for the existing Spring Boot backend. It is designed to run on `localhost:8080` so the existing React frontend can stay unchanged.

## Setup

```powershell
cd DBMS_SportsSphere/BackendNode
copy .env.example .env
npm install
npx prisma generate
npm run dev
```

## Database Safety

- This backend is configured for the existing MySQL database through `DATABASE_URL`.
- Do not run `prisma migrate` against the current `dbms_lab` database.
- If you want Prisma to exactly match the live database, run:

```powershell
npx prisma db pull
npx prisma generate
```

## Compatibility Notes

- `POST /api/auth/login` returns the JWT as a raw string, matching the Spring backend.
- JWT payload contains `id`, `sub`, `role`, and `exp`, matching the existing frontend decoder.
- Public endpoints are preserved: `/api/auth/**`, `/api/facilities/all`, and `/api/events/all`.
- The AI route `/api/llm/ask` proxies to `AI_SERVICE_URL`, defaulting to `http://localhost:8000/ask`.

## Important

Rotate any exposed secrets before using this backend. Keep `.env` out of Git.
