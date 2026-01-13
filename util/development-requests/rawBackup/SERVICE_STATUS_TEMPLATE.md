# Service Status Report

Use this template to document which services and endpoints are working.

## Service Overview

| Service | Port | Status | Auth Method | Notes |
|---------|------|--------|-------------|-------|
| **Frontend** | 5173 | 🟡 Not Tested | Auth0 (User) | React app |
| **FastAPI Backend** | 8000 | ⚫ Unknown | Auth0 M2M | Python/FastAPI |
| **EPD Backend** | 3002 | ✅ Working | Auth0 M2M | TypeScript/Express |
| **Mail Service** | 3001 | ✅ Working | Auth0 M2M | TypeScript/Express |

**Legend:**
- ✅ Working - Service confirmed operational
- ❌ Not Working - Service has issues
- 🟡 Not Tested - Status unknown
- ⚫ Unknown - Needs verification

---

## Detailed Status

### FastAPI Backend (Port 8000)

**Base URL:** `http://localhost:8000/api`

| Endpoint | Method | Auth Required | Status | Notes |
|----------|--------|---------------|--------|-------|
| `/` | GET | No | ⚫ | Root endpoint |
| `/auth/login/` | POST | No | ⚫ | Get M2M token |
| `/patient/` | GET | Yes | ⚫ | List patients |
| `/patient/{id}` | GET | Yes | ⚫ | Get patient |
| `/encounters/` | GET | Yes | ⚫ | List encounters |
| `/encounters/{id}` | GET | Yes | ⚫ | Get encounter |
| `/mails/user/{id}` | GET | Yes | ⚫ | List user mails |
| `/mails/user/{id}/count` | GET | Yes | ⚫ | Mail count |

**Overall Status:** ⚫ Unknown - Run `npm run test:endpoints` to verify

---

### EPD Backend (Port 3002)

**Base URL:** `http://localhost:3002`

| Endpoint | Method | Auth Required | Status | Notes |
|----------|--------|---------------|--------|-------|
| `/health` | GET | No | ✅ | Health check working |
| `/api/users` | GET | Yes | ✅ | Requires `read:users` |
| `/api/patients` | GET | Yes | ✅ | Pagination working |
| `/api/encounters` | GET | Yes | ✅ | Pagination working |
| `/api/medications` | GET | Yes | ✅ | Filtering available |
| `/api/allergies` | GET | Yes | ✅ | CRUD operations |
| `/api/vitals` | GET | Yes | ✅ | Vital signs tracking |
| `/api/lab-results` | GET | Yes | ✅ | Lab test results |
| `/api/appointments` | GET | Yes | ✅ | Appointment scheduling |
| `/api/insurance/insurers` | GET | Yes | ✅ | Insurance companies |
| `/api/insurance/policies` | GET | Yes | ✅ | Patient policies |

**Overall Status:** ✅ Working - All tested endpoints operational

**Notes:**
- Auth0 M2M authentication required
- Swagger docs at `/api-docs`
- 60 test patients seeded
- All CRUD operations tested

---

### Mail Service (Port 3001)

**Base URL:** `http://localhost:3001`

| Endpoint | Method | Auth Required | Status | Notes |
|----------|--------|---------------|--------|-------|
| `/health` | GET | No | ✅ | Health check working |
| `/api/mails/user/{userId}/count` | GET | Yes | ✅ | Count endpoint |
| `/api/mails/user/{userId}` | GET | Yes | ✅ | List user mails |
| `/api/mails/{id}` | GET | Yes | ✅ | Get single mail |
| `/api/mails/` | POST | Yes | ✅ | Create mail |
| `/api/mails/{id}/read` | PATCH | Yes | ✅ | Mark as read |
| `/api/mails/{id}` | DELETE | Yes | ✅ | Delete mail |

**Overall Status:** ✅ Working - All endpoints tested and operational

**Notes:**
- PostgreSQL database on port 5433
- M2M authentication working
- Email validation implemented
- Test data available via seed script

---

## Authentication Status

### Auth0 Configuration

| Component | Status | Notes |
|-----------|--------|-------|
| **Auth0 Tenant** | ✅ | `diabeticum-pedis.eu.auth0.com` |
| **M2M Application** | ✅ | Configured for EPD & Mail |
| **API Audience** | ✅ | `https://api.epd-service.local` |
| **Token Generation** | ✅ | Working via client credentials flow |
| **Token Validation** | ✅ | EPD & Mail validating correctly |

### Required Permissions

| Permission | EPD | Mail | FastAPI | Notes |
|------------|-----|------|---------|-------|
| `patients:get` | ✅ | - | ✅ | Read patients |
| `patients:create` | ✅ | - | ✅ | Create patients |
| `patients:update` | ✅ | - | ✅ | Update patients |
| `patients:remove` | ✅ | - | ✅ | Delete patients |
| `encounters:get` | ✅ | - | ✅ | Read encounters |
| `encounters:create` | ✅ | - | ✅ | Create encounters |
| `mails:get` | - | ✅ | ✅ | Read mails |
| `mails:create` | - | ✅ | ✅ | Create mails |
| `read:users` | ✅ | - | - | User management |
| `admin:all` | ✅ | - | - | Admin access |

---

## Database Status

| Service | Database | Port | Status | Notes |
|---------|----------|------|--------|-------|
| **EPD** | PostgreSQL | 5432 | ✅ | Prisma ORM, 60 patients seeded |
| **Mail** | PostgreSQL | 5433 | ✅ | Prisma ORM, test data available |
| **FastAPI** | PostgreSQL | TBD | ⚫ | Unknown configuration |

---

## Docker Status

| Container | Status | Port Mapping | Notes |
|-----------|--------|--------------|-------|
| **epd-db** | ✅ Running | 5432:5432 | EPD database |
| **epd-backend** | ✅ Running | 3002:3001 | EPD API |
| **mail-db** | ✅ Running | 5433:5432 | Mail database |
| **mail-service** | ✅ Running | 3001:3001 | Mail API |
| **backend** | ⚫ Unknown | 8000:8000 | FastAPI |
| **frontend** | 🟡 Not Running | 5173:3000 | React app |

**Check with:** `docker ps`

---

## Known Issues

### EPD Backend
- ✅ No known issues
- All endpoints tested and working
- Auth0 integration complete

### Mail Service
- ✅ No known issues
- All CRUD operations working
- Database connection stable

### FastAPI Backend
- ⚫ **Status Unknown** - Needs testing
- May require environment configuration
- Auth0 integration may need verification

### Frontend
- 🟡 **Not in test scope** - Requires browser testing
- Auth0 user authentication (not M2M)
- Separate testing methodology needed

---

## Testing Recommendations

### Immediate Actions
1. ✅ **Done:** EPD Backend fully tested
2. ✅ **Done:** Mail Service fully tested
3. ⚫ **Todo:** Test FastAPI Backend
4. 🟡 **Todo:** Frontend integration testing

### Next Steps
1. Run automated tests: `npm run test:endpoints`
2. Review `TEST_REPORT.md` for detailed results
3. Update this document with actual results
4. Document any issues found
5. Create tickets for failures

### Continuous Testing
- Run tests before each deployment
- Include in CI/CD pipeline
- Monitor response times
- Track success rates over time

---

## Support & Resources

### Documentation
- [API Testing Guide](./API_TESTING_GUIDE.md) - Complete JMeter guide
- [Testing Quick Start](./TESTING_QUICKSTART.md) - 5-minute setup
- [EPD Authentication](./epd/docs/AUTHENTICATION.md) - Auth0 setup
- [Mail Service](./mail/README.md) - Mail API docs

### Tools
- **Automated Tests:** `npm run test:endpoints`
- **Manual Testing:** Postman/Insomnia collections available
- **Database:** `npm run prisma:studio` (in epd/ or mail/)
- **Swagger:** `http://localhost:3002/api-docs` (EPD only)

### Team Contacts
- **Auth0 Access:** Ask team lead for credentials
- **Database Issues:** Check service-specific README
- **General Support:** Team Slack/Discord

---

**Last Updated:** [Add date after running tests]
**Updated By:** [Your name]
**Test Run ID:** [Generated from TEST_REPORT.md]