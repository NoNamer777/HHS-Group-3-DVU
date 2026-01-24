# API Endpoint Testing Suite

Automated testing for all DVU backend services.

## ?? Quick Start

```bash
# 1. Setup
./setup-testing.sh  # Linux/Mac
# or
.\setup-testing.ps1  # Windows

# 2. Configure Auth0
cp .env.example .env
# Edit .env with your credentials

# 3. Run tests
npm run test:endpoints
```

## ?? Files in This Directory

- **`test-all-endpoints.ts`** - Main test script (TypeScript)
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`.env.example`** - Environment variables template
- **`.gitignore`** - Git ignore rules
- **`API_TESTING_GUIDE.md`** - Complete JMeter guide
- **`TESTING_QUICKSTART.md`** - 5-minute setup guide
- **`SERVICE_STATUS_TEMPLATE.md`** - Status documentation template
- **`setup-testing.sh`** - Bash setup script
- **`setup-testing.ps1`** - PowerShell setup script

## ?? What It Tests

### FastAPI Backend (Port 8000)
- Health check
- Authentication
- Patients CRUD
- Encounters CRUD
- Mails endpoints

### EPD Backend (Port 3002)
- Health check
- Users, Patients, Encounters
- Medications, Allergies, Vitals
- Lab Results, Appointments
- Insurance policies

### Mail Service (Port 3001)
- Health check
- Mail count
- User mails
- CRUD operations

## ?? Output

After running tests, you'll get:
- **Console:** Color-coded results with response times
- **File:** `TEST_REPORT.md` with detailed report

## ?? Requirements

- Node.js v24+
- npm v11+
- Docker (optional, for running services)
- Auth0 credentials (ask your team lead)

## ?? Documentation

- **Quick Setup:** See `TESTING_QUICKSTART.md`
- **JMeter Guide:** See `API_TESTING_GUIDE.md`
- **Service Status:** See `SERVICE_STATUS_TEMPLATE.md`

## ?? Auth0 Configuration

Required environment variables:
```env
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.epd-service.local
```

## ?? Troubleshooting

**Connection refused:**
- Check services are running: `docker ps`
- Verify ports 8000, 3001, 3002 are available

**Auth failed:**
- Verify Auth0 credentials in `.env`
- Check M2M application is authorized
- Confirm scopes/permissions are configured

**Tests skipped:**
- Missing Auth0 token (check credentials)
- Service not responding (check Docker)

## ?? Contributing

When adding new endpoints:
1. Add to `test-all-endpoints.ts`
2. Update `API_TESTING_GUIDE.md`
3. Run tests to verify
4. Commit both code and documentation

## ?? Notes

- Tests run sequentially (not parallel)
- Auth token is cached and reused
- Failed tests exit with code 1 (CI/CD friendly)
- Reports are overwritten on each run

---

**Part of:** HHS Group 3 DVU Project  
**Location:** `util/development-requests/raw/`  
**Maintained by:** Development Team
