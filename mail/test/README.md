# Mail Service Tests

## Auth0 M2M Testing

De oude JWT-based unit tests zijn verwijderd omdat de mail service nu Auth0 M2M (machine-to-machine) authenticatie gebruikt.

### M2M Test Script

Voor het testen van de M2M authenticatie, gebruik:

```bash
npm run test:m2m
```

Dit script (`test-m2m.ts`) test:
- ✅ Health check endpoint (onbeveiligd)
- ✅ Auth requirement (401 zonder token)
- ✅ Token verkrijgen via Auth0
- ✅ GET requests met M2M token
- ✅ POST requests met M2M token
- ✅ COUNT requests met M2M token

### Nieuwe Unit Tests Schrijven

Voor nieuwe unit tests met Auth0 M2M:

1. Mock de `express-oauth2-jwt-bearer` library
2. Test de business logic, niet de Auth0 validatie
3. Of schrijf integration tests die echte Auth0 tokens gebruiken (zoals test-m2m.ts)

### Integration Tests

Het huidige `test-m2m.ts` script is een integration test die:
- Echte Auth0 tokens verkrijgt
- De database gebruikt
- De API endpoints test
- Automatisch test users aanmaakt en opruimt

Dit is de aanbevolen manier om M2M authenticatie te testen.
