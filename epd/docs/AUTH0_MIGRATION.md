# Auth0 Migration Guide voor EPD

## ✅ Auth0 Integratie Voltooid!

Het EPD gebruikt nu **Auth0 M2M (Machine-to-Machine)** authenticatie, net zoals de mail service.

## Wat is veranderd?

### 1. **Middleware**
- **Oud**: JWT tokens met `authenticateToken` middleware
- **Nieuw**: Auth0 M2M tokens met `authenticateAuth0` middleware

### 2. **Dependencies**
- **Toegevoegd**: `express-oauth2-jwt-bearer` voor Auth0 JWT validatie
- **Toegevoegd**: `axios` voor M2M testing

### 3. **Environment Variables**
Nieuwe `.env` variabelen:
```env
AUTH0_ISSUER_BASE_URL="https://diabeticum-pedis.eu.auth0.com"
AUTH0_AUDIENCE="https://api.epd-service.local"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
```

### 4. **Alle Routes Beveiligd**
Alle API endpoints vereisen nu een geldig Auth0 M2M token:
- `/api/patients`
- `/api/encounters`
- `/api/medical-records`
- `/api/diagnoses`
- `/api/medications`
- `/api/allergies`
- `/api/vitals`
- `/api/lab-results`
- `/api/appointments`
- `/api/insurance`
- `/api/users`

## Auth0 Setup (Admin/DevOps)

### Stap 1: Maak een API in Auth0
1. Ga naar [Auth0 Dashboard](https://manage.auth0.com)
2. Navigeer naar **Applications > APIs**
3. Klik **Create API**
4. Vul in:
   - **Name**: EPD Service API
   - **Identifier**: `https://api.epd-service.local`
   - **Signing Algorithm**: RS256
5. Klik **Create**

### Stap 2: Maak een M2M Application
1. Navigeer naar **Applications > Applications**
2. Klik **Create Application**
3. Vul in:
   - **Name**: EPD M2M Client
   - **Type**: Machine to Machine Applications
4. Selecteer de **EPD Service API**
5. Autoriseer de gewenste permissions (scopes)
6. Kopieer de **Client ID** en **Client Secret**

### Stap 3: Configureer Permissions (Optioneel)
In Auth0 Dashboard > APIs > EPD Service API > Permissions:
```
read:patients
write:patients
read:encounters
write:encounters
read:users
write:users
admin:all
```

## Testing

### 1. Update .env bestand
```bash
cp .env.example .env
# Vul de Auth0 credentials in
```

### 2. Test M2M Authenticatie
```bash
npm run test:m2m
```

Dit test script:
- ✅ Haalt een Auth0 M2M token op
- ✅ Test de `/health` endpoint (geen auth vereist)
- ✅ Test beveiligde endpoints met het token

### 3. Handmatig testen met cURL

**Stap 1: Haal een token op**
```bash
curl --request POST \
  --url https://diabeticum-pedis.eu.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "audience": "https://api.epd-service.local",
    "grant_type": "client_credentials"
  }'
```

**Stap 2: Gebruik het token**
```bash
curl --request GET \
  --url http://localhost:3001/api/patients \
  --header 'authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Migration van JWT naar Auth0

### Voor Frontend/Client Apps:
Als je een frontend hebt die nu JWT tokens gebruikt:

1. **Verwijder** de oude login/register endpoints
2. **Implementeer** Auth0 SDK:
   - React: `@auth0/auth0-react`
   - Vue: `@auth0/auth0-vue`
   - Angular: `@auth0/auth0-angular`

3. **Configureer** Auth0 voor Single Page Applications

### Voor Backend-to-Backend (M2M):
Gebruik het `test-m2m.ts` script als voorbeeld:

```typescript
import axios from 'axios';

// 1. Haal token op van Auth0
const tokenResponse = await axios.post(
  'https://diabeticum-pedis.eu.auth0.com/oauth/token',
  {
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    audience: 'https://api.epd-service.local',
    grant_type: 'client_credentials'
  }
);

const token = tokenResponse.data.access_token;

// 2. Gebruik token in API calls
const response = await axios.get('http://localhost:3001/api/patients', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Middleware Features

### Basis Authenticatie
```typescript
import { authenticateAuth0 } from '../middlewares/auth0.middleware';

router.use(authenticateAuth0);
```

### Permission-based Authorization
```typescript
import { requirePermission, requireAnyPermission, requireAllPermissions } from '../middlewares/auth0.middleware';

// Single permission
router.get('/admin', authenticateAuth0, requirePermission('admin:all'), handler);

// Any of multiple permissions
router.get('/users', authenticateAuth0, requireAnyPermission('read:users', 'admin:all'), handler);

// All permissions required
router.post('/critical', authenticateAuth0, requireAllPermissions('write:data', 'admin:all'), handler);
```

## Troubleshooting

### "Invalid token" errors
- ✅ Check of `AUTH0_ISSUER_BASE_URL` correct is
- ✅ Check of `AUTH0_AUDIENCE` overeenkomt met Auth0 API Identifier
- ✅ Controleer of token niet verlopen is (standaard 24u)

### "Unauthorized" errors
- ✅ Check of `Authorization: Bearer <token>` header correct is
- ✅ Controleer of Client ID en Secret correct zijn
- ✅ Verify dat de M2M application geautoriseerd is voor de API

### Connection errors
- ✅ Check of EPD service draait (`npm run dev`)
- ✅ Verify dat Auth0 domain bereikbaar is
- ✅ Check firewall/proxy instellingen

## Legacy JWT Support (Deprecated)

De oude JWT authenticatie is nog steeds beschikbaar in:
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/controllers/auth.controller.ts`

⚠️ **Deze zullen in een toekomstige versie verwijderd worden.**

## Voordelen van Auth0

✅ **Centraal beheer** - Eén authenticatie systeem voor alle services  
✅ **Enterprise features** - MFA, SSO, Social logins  
✅ **Beter beveiligd** - Token rotation, anomaly detection  
✅ **Schaalbaar** - Automatische token management  
✅ **Compliance** - GDPR, SOC2, ISO27001 certified  

## Volgende Stappen

1. ✅ Configureer Auth0 tenant en API
2. ✅ Update `.env` met credentials
3. ✅ Test met `npm run test:m2m`
4. 🔄 Migreer frontend naar Auth0 SDK
5. 🔄 Verwijder legacy JWT endpoints
6. 🔄 Deploy naar productie

---

**Hulp nodig?** Check de [Auth0 Documentation](https://auth0.com/docs) of het mail service voorbeeld in `mail/src/middleware/auth.ts`.
