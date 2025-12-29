# EPD API Test Suite

⚠️ **CRITICAL**: Test suite removed during Auth0 migration - NEW TESTS REQUIRED BEFORE PRODUCTION!

The old JWT-based test suite has been removed. **This feature is incomplete** until comprehensive Auth0 M2M tests are implemented.

## 🚨 Action Items Before Production

- [ ] Set up dedicated Auth0 test tenant or mock server
- [ ] Configure test environment variables in CI/CD pipeline
- [ ] Implement Auth0 token helper utilities
- [ ] Recreate patient management tests (11 tests)
- [ ] Recreate encounter tests (10 tests)
- [ ] Recreate medical record tests (9 tests)
- [ ] Recreate diagnosis tests (10 tests)
- [ ] Recreate medication tests (11 tests)
- [ ] Recreate allergy tests (10 tests)
- [ ] Recreate vital signs tests (11 tests)
- [ ] Recreate lab result tests (11 tests)
- [ ] Recreate appointment tests (13 tests)
- [ ] Recreate insurance tests (16 tests)
- [ ] Achieve minimum 80% code coverage
- [ ] Set up automated test execution in CI/CD

**Target**: ~120 tests covering all API endpoints with Auth0 authentication

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

