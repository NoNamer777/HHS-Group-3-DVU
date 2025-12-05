# EPD API Test Suite

Comprehensive test suite for the EPD (Electronic Patient Record) backend API using Jest and Supertest.

## Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── middlewares/                # Middleware tests
│   └── auth.middleware.test.ts
├── auth/                       # Authentication tests
│   └── auth.test.ts
├── patients/                   # Patient management tests
│   └── patient.test.ts
├── encounters/                 # Encounter tests
│   └── encounter.test.ts
├── medical-records/            # Medical record tests
│   └── medicalRecord.test.ts
├── diagnoses/                  # Diagnosis tests
│   └── diagnosis.test.ts
├── medications/                # Medication tests
│   └── medication.test.ts
├── allergies/                  # Allergy tests
│   └── allergy.test.ts
├── vitals/                     # Vital signs tests
│   └── vital.test.ts
├── lab-results/                # Lab result tests
│   └── labResult.test.ts
├── appointments/               # Appointment tests
│   └── appointment.test.ts
└── insurance/                  # Insurance tests
    └── insurance.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests with verbose output
```bash
npm run test:verbose
```

### Run specific test file
```bash
npm test -- tests/auth/auth.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="Diagnosis"
```

## Test Coverage

The test suite covers:

### Authentication & Authorization (16 tests)
- User registration (duplicate handling, validation)
- User login (valid/invalid credentials)
- JWT token authentication
- Role-based authorization middleware

### Patient Management (11 tests)
- Create, read, update, delete patients
- Pagination and filtering
- Search functionality
- Duplicate hospital number prevention

### Encounters (10 tests)
- Create and manage encounters
- Status and type filtering
- Patient association
- Date range queries

### Medical Records (9 tests)
- Record creation (NOTE, CONSULTATION types)
- Patient and encounter filtering
- Update and delete operations

### Diagnoses (10 tests)
- Diagnosis CRUD operations
- ICD code tracking
- Status management (ACTIVE, RESOLVED)
- Type classification (PRIMARY, SECONDARY)

### Medications (11 tests)
- Medication order creation
- Dosage and frequency tracking
- Route administration
- Status updates (ACTIVE, COMPLETED, DISCONTINUED)

### Allergies (10 tests)
- Allergy recording
- Severity levels (MILD, MODERATE, SEVERE)
- Status tracking (ACTIVE, RESOLVED)
- Reaction documentation

### Vital Signs (11 tests)
- Vital signs recording
- Multiple parameters (temperature, BP, heart rate, etc.)
- Date range filtering
- Trend analysis support

### Lab Results (11 tests)
- Lab test ordering
- Result documentation
- Status tracking (PENDING, COMPLETED, CANCELLED)
- Category classification
- Interpretation notes

### Appointments (13 tests)
- Appointment scheduling
- Status management (SCHEDULED, CONFIRMED, CANCELLED)
- Type classification
- Rescheduling functionality
- Date range queries

### Insurance (16 tests)
- Insurer management
- Policy creation and management
- Coverage type tracking
- Status updates (ACTIVE, EXPIRED, CANCELLED)

**Total: 128+ test cases**

## Test Configuration

### Jest Configuration (`jest.config.ts`)
- **Test Environment**: Node.js
- **Test Pattern**: `**/*.test.ts`
- **Coverage Collection**: All source files in `backend/src/`
- **Timeout**: 10 seconds per test
- **Setup File**: `tests/setup.ts`

### Global Setup (`tests/setup.ts`)
- Initializes Prisma client for database access
- Sets test environment variables
- Configures JWT secret for testing
- Handles cleanup with afterAll hook

## Test Database

Tests use the same PostgreSQL database as development but with `NODE_ENV=test`. Each test suite:

1. Creates unique test data using timestamps
2. Authenticates test users
3. Runs isolated test cases
4. Database cleanup is handled by Prisma cascade deletes

## Writing New Tests

### Basic Test Structure

```typescript
import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Feature Name', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'DOCTOR'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userResponse.body.email,
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/resource', () => {
    it('should create a new resource', async () => {
      const response = await request(app)
        .post('/api/resource')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // test data
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/resource')
        .send({
          // test data
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### Best Practices

1. **Unique Test Data**: Use `Date.now()` or UUIDs to avoid conflicts
2. **Authentication**: Always test both authenticated and unauthenticated scenarios
3. **Error Cases**: Test validation, 404s, and error handling
4. **Cleanup**: Let Prisma cascade deletes handle cleanup
5. **Assertions**: Verify status codes, response structure, and data integrity
6. **Isolation**: Each test should be independent and not rely on other tests

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage report
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `jest.config.ts` or individual tests
- Check database connection
- Ensure Docker containers are running

### Database Connection Errors
- Verify PostgreSQL is running: `docker ps`
- Check DATABASE_URL in environment
- Ensure migrations are up to date

### Authentication Failures
- Verify JWT_SECRET is set in test environment
- Check token expiration settings
- Ensure user roles match endpoint requirements

### Port Conflicts
- Tests use in-memory Express app (no port binding)
- Ensure no other services are using test database

## Coverage Goals

Current coverage targets:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View detailed coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```
