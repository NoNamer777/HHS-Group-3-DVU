# Mail Service

Mock mail service voor EPD integratie met PostgreSQL database.

## Setup

1. **Installeer dependencies:**
   ```bash
   npm install
   ```

2. **Start de database:**
   ```bash
   docker-compose up -d
   ```

3. **Run Prisma migraties:**
   ```bash
   npm run prisma:migrate
   ```

4. **Start de development server:**
   ```bash
   npm run dev
   ```

De service draait op `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Check of de service draait (geen auth vereist)

### Mail Endpoints (alle beveiligd met JWT)

**Authenticatie vereist:** Alle endpoints vereisen een Bearer token in de Authorization header:
```
Authorization: Bearer <jwt-token>
```

- `GET /api/mails/user/:userId` - Haal alle mails op voor een gebruiker (alleen eigen userId)
- `GET /api/mails/:id` - Haal een specifieke mail op (alleen eigen mails)
- `POST /api/mails` - Maak een nieuwe mail aan (alleen voor eigen userId)
  ```json
  {
    "userId": "user-id",
    "from": "sender@example.com",
    "to": "receiver@example.com",
    "subject": "Test Subject",
    "body": "Mail body content"
  }
  ```
- `PATCH /api/mails/:id/read` - Markeer mail als gelezen (alleen eigen mails)
- `DELETE /api/mails/:id` - Verwijder een mail (alleen eigen mails)
- `GET /api/mails/user/:userId/count` - Haal aantal mails op (alleen eigen userId)

### Beveiliging

- **JWT Authenticatie:** Alle endpoints (behalve /health) zijn beveiligd met JWT tokens
- **Ownership Validatie:** Gebruikers kunnen alleen hun eigen mails bekijken en bewerken
- **Bearer Token:** Gebruik `Authorization: Bearer <token>` header voor alle requests

## Database

PostgreSQL database draait in Docker op poort `5433`.

### Prisma Commands
- `npm run prisma:studio` - Open Prisma Studio om data te bekijken
- `npm run prisma:generate` - Genereer Prisma Client
- `npm run prisma:migrate` - Run database migraties

## Environment Variables

Zie `.env` file voor configuratie:
- `DATABASE_URL` - PostgreSQL connectie string
- `PORT` - Server poort (default: 3001)
- `JWT_SECRET` - Secret key voor JWT tokens (verander in productie!)
- `JWT_REFRESH_SECRET` - Secret key voor refresh tokens (verander in productie!)

## Production Build

```bash
npm run build
npm start
```

## Testing

Run de tests met:
```bash
npm test              # Run alle tests met coverage
npm run test:watch    # Run tests in watch mode
```

De tests dekken:
- ✅ JWT authenticatie middleware
- ✅ User access validatie
- ✅ Alle API endpoints
- ✅ Ownership checks
- ✅ Error scenarios
