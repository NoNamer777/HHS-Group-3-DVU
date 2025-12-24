# Authentication - Auth0 M2M

## Overview

Het EPD API gebruikt **Auth0 Machine-to-Machine (M2M)** authenticatie voor beveiligde API toegang.

## Auth0 M2M Flow

### 1. Verkrijg Access Token van Auth0

**Request:**
```http
POST https://diabeticum-pedis.eu.auth0.com/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "audience": "https://api.epd-service.local",
  "grant_type": "client_credentials"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

### 2. Gebruik Token voor API Requests

Include het access token in de Authorization header:

```http
GET /api/patients
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

## Beveiligde Endpoints

Alle API endpoints vereisen een geldig Auth0 M2M token:

- `/api/patients` - Patiënt gegevens
- `/api/encounters` - Encounters/consulten
- `/api/medical-records` - Medische dossiers
- `/api/diagnoses` - Diagnoses
- `/api/medications` - Medicatie
- `/api/allergies` - Allergieën
- `/api/vitals` - Vitale functies
- `/api/lab-results` - Laboratorium resultaten
- `/api/appointments` - Afspraken
- `/api/insurance` - Verzekeringen
- `/api/users` - Gebruikers (vereist extra permissions)

## Permissions (Scopes)

Sommige endpoints vereisen specifieke permissions:

### User Management
- `read:users` - Lezen van gebruikers
- `write:users` - Aanmaken/wijzigen van gebruikers
- `admin:all` - Volledige admin toegang

### Voorbeeld met Permissions

```typescript
// User lijst ophalen (vereist read:users of admin:all)
router.get('/api/users', 
  authenticateAuth0,
  requireAnyPermission('read:users', 'admin:all'),
  handler
);
```

## Setup voor Developers

### Environment Variables

Maak een `.env` bestand in de `epd/` folder:

```env
# Database
DATABASE_URL="postgresql://epd_user:epd_password@localhost:5432/epd_db"

# Server
PORT=3002
NODE_ENV=development

# Auth0 M2M Configuration
AUTH0_ISSUER_BASE_URL="https://diabeticum-pedis.eu.auth0.com"
AUTH0_AUDIENCE="https://api.epd-service.local"

# Auth0 M2M Credentials (vraag aan je team lead)
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
```

### Testing

Test de Auth0 integratie:

```bash
npm run test:m2m
```

## Code Voorbeelden

### Node.js / TypeScript

```typescript
import axios from 'axios';

// 1. Verkrijg token
const tokenResponse = await axios.post(
  'https://diabeticum-pedis.eu.auth0.com/oauth/token',
  {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: 'https://api.epd-service.local',
    grant_type: 'client_credentials'
  }
);

const token = tokenResponse.data.access_token;

// 2. Gebruik token
const patients = await axios.get('http://localhost:3002/api/patients', {
  headers: { Authorization: `Bearer ${token}` }
});

console.log(patients.data);
```

### Python

```python
import requests

# 1. Verkrijg token
token_response = requests.post(
    'https://diabeticum-pedis.eu.auth0.com/oauth/token',
    json={
        'client_id': 'YOUR_CLIENT_ID',
        'client_secret': 'YOUR_CLIENT_SECRET',
        'audience': 'https://api.epd-service.local',
        'grant_type': 'client_credentials'
    }
)

token = token_response.json()['access_token']

# 2. Gebruik token
patients = requests.get(
    'http://localhost:3002/api/patients',
    headers={'Authorization': f'Bearer {token}'}
)

print(patients.json())
```

### cURL

```bash
# 1. Verkrijg token
TOKEN=$(curl -s --request POST \
  --url https://diabeticum-pedis.eu.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "audience": "https://api.epd-service.local",
    "grant_type": "client_credentials"
  }' | jq -r '.access_token')

# 2. Gebruik token
curl --request GET \
  --url http://localhost:3002/api/patients \
  --header "authorization: Bearer $TOKEN"
```

## Token Eigenschappen

- **Expiratie**: 24 uur (standaard)
- **Type**: JWT (JSON Web Token)
- **Algoritme**: RS256 (RSA Signature met SHA-256)
- **Issuer**: `https://diabeticum-pedis.eu.auth0.com/`
- **Audience**: `https://api.epd-service.local`

## Security Best Practices

✅ **Bewaar Client Secret veilig** - Nooit in version control  
✅ **Gebruik HTTPS** in productie  
✅ **Roteer credentials** regelmatig  
✅ **Minimum permissions** - Geef alleen benodigde scopes  
✅ **Monitor token gebruik** in Auth0 dashboard  
✅ **Revoke compromised tokens** onmiddellijk  

## Troubleshooting

### "Invalid token" error

- Controleer of token niet verlopen is
- Verify dat `AUTH0_AUDIENCE` correct is
- Check of `AUTH0_ISSUER_BASE_URL` klopt

### "Unauthorized" error

- Controleer of Authorization header correct is: `Bearer <token>`
- Verify dat Client ID en Secret correct zijn
- Check of M2M application geautoriseerd is voor de API

### "Insufficient permissions" error

- Check of je M2M application de benodigde permissions heeft
- Ga naar Auth0 Dashboard → Applications → [Your App] → APIs
- Autoriseer de benodigde scopes

## Meer Informatie

- [Auth0 M2M Documentation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-credentials-flow)
- [Auth0 Dashboard](https://manage.auth0.com)
- [EPD Migration Guide](./AUTH0_MIGRATION.md)
- [Legacy JWT Docs](./AUTHENTICATION_LEGACY.md) (deprecated)
