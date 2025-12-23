# EPD API Test Suite

⚠️ **Note**: Test suite removed during Auth0 migration.

The old JWT-based test suite has been removed. New tests need to be written for Auth0 M2M authentication.

## TODO: Create New Test Suite

Tests should use Auth0 M2M tokens obtained via client credentials flow.

Example test structure:
```typescript
import axios from 'axios';

async function getAuth0Token() {
  const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
    grant_type: 'client_credentials'
  });
  return response.data.access_token;
}

describe('Patient API', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuth0Token();
  });

  it('should fetch patients with valid token', async () => {
    const response = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });
});
```

For manual API testing, use the M2M test script:
```bash
npm run test:m2m
```

See [docs/AUTH0_MIGRATION.md](../docs/AUTH0_MIGRATION.md) for more Auth0 testing examples.

