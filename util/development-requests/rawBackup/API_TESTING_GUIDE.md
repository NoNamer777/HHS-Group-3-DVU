# API Testing Guide

Complete endpoint specification for testing the DVU application backend services for use with JMeter or other testing tools.

---

## ?? Service Overview

| Service | Base URL | Port | Authentication |
|---------|----------|------|----------------|
| **FastAPI Backend** | `http://localhost:8000/api` | 8000 | Auth0 M2M Token |
| **EPD Backend** | `http://localhost:3002/api` | 3002 | Auth0 M2M Token |
| **Mail Service** | `http://localhost:3001/api` | 3001 | Auth0 M2M Token |

---

## ?? Authentication Setup

### Get Auth0 M2M Token

**Endpoint:** `POST https://diabeticum-pedis.eu.auth0.com/oauth/token`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "client_id": "${AUTH0_CLIENT_ID}",
  "client_secret": "${AUTH0_CLIENT_SECRET}",
  "audience": "https://api.epd-service.local",
  "grant_type": "client_credentials"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

**JMeter Setup:**
1. Add JSON Extractor to extract `access_token`
2. Store in variable: `${AUTH_TOKEN}`
3. Use in subsequent requests: `Authorization: Bearer ${AUTH_TOKEN}`

---

## 1?? FastAPI Backend (Port 8000)

### Health Check

#### GET `/`
- **URL:** `http://localhost:8000/api/`
- **Method:** `GET`
- **Headers:** None required
- **Expected Response:** `200 OK`
```json
{
  "message": "Hello World!!"
}
```

---

### Authentication

#### POST `/auth/login/`
- **URL:** `http://localhost:8000/api/auth/login/`
- **Method:** `POST`
- **Headers:**
```
Content-Type: application/json
```
- **Body:** None required
- **Scopes Required:** None
- **Expected Response:** `200 OK`
```json
{
  "access_token": "string",
  "token_type": "Bearer"
}
```

---

### Patients

#### GET `/patient/` (List All Patients)
- **URL:** `http://localhost:8000/api/patient/?limit=10&offset=0`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Query Parameters:**
  - `limit` (optional, int): `10`
  - `offset` (optional, int): `0`
  - `patient_status` (optional): `ACTIVE` | `INACTIVE` | `DECEASED`
  - `search` (optional, string): Search string
- **Scopes Required:** `patients:get`
- **Expected Response:** `200 OK`

#### GET `/patient/{patient_id}` (Get Single Patient)
- **URL:** `http://localhost:8000/api/patient/1`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Scopes Required:** `patients:get`
- **Expected Response:** `200 OK`

#### POST `/patient/` (Create Patient)
- **URL:** `http://localhost:8000/api/patient/`
- **Method:** `POST`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-05-15",
  "gender": "FEMALE",
  "email": "jane.smith@example.com",
  "phone": "0687654321",
  "address": "Park Avenue 456"
}
```
- **Scopes Required:** `patients:create`
- **Expected Response:** `201 Created`

#### PUT `/patient/{patient_id}` (Update Patient)
- **URL:** `http://localhost:8000/api/patient/1`
- **Method:** `PUT`
- **Headers:** Same as POST
- **Body:** Same as POST
- **Scopes Required:** `patients:update`
- **Expected Response:** `200 OK`

#### DELETE `/patient/{patient_id}` (Delete Patient)
- **URL:** `http://localhost:8000/api/patient/1`
- **Method:** `DELETE`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
```
- **Scopes Required:** `patients:remove`
- **Expected Response:** `200 OK`

---

### Encounters

#### GET `/encounters/` (List Encounters)
- **URL:** `http://localhost:8000/api/encounters/?page=1&limit=10`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Query Parameters:**
  - `page` (optional, int): `1`
  - `limit` (optional, int): `10`
  - `encounter_id` (optional, int): Filter by ID
  - `encounter_status` (optional): `PLANNED` | `IN_PROGRESS` | `FINISHED` | `CANCELLED`
  - `encounter_type` (optional): `INPATIENT` | `OUTPATIENT` | `EMERGENCY`
- **Scopes Required:** `encounters:get`
- **Expected Response:** `200 OK`

#### POST `/encounters/` (Create Encounter)
- **URL:** `http://localhost:8000/api/encounters/`
- **Method:** `POST`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Body:**
```json
{
  "type": "OUTPATIENT",
  "status": "PLANNED",
  "start": "2024-01-15T10:00:00Z",
  "end": "2024-01-15T11:00:00Z",
  "reason": "Regular checkup",
  "patientId": 1
}
```
- **Scopes Required:** `encounters:create`
- **Expected Response:** `201 Created`

---

### Mails

#### GET `/mails/user/{user_id}` (Get User Mails)
- **URL:** `http://localhost:8000/api/mails/user/1`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Scopes Required:** `mails:get`
- **Expected Response:** `200 OK`

#### GET `/mails/user/{user_id}/count` (Get Mail Count)
- **URL:** `http://localhost:8000/api/mails/user/1/count`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH_TOKEN}
Content-Type: application/json
```
- **Scopes Required:** `mails:get`
- **Expected Response:** `200 OK`
```json
{
  "unreadCount": 5,
  "totalCount": 25
}
```

---

## 2?? EPD Backend (Port 3002)

### Health Check

#### GET `/health`
- **URL:** `http://localhost:3002/health`
- **Method:** `GET`
- **Headers:** None required
- **Expected Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-03T12:00:00.000Z"
}
```

---

### Users

#### GET `/api/users` (List Users)
- **URL:** `http://localhost:3002/api/users`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH0_M2M_TOKEN}
Content-Type: application/json
```
- **Permissions Required:** `read:users` or `admin:all`
- **Expected Response:** `200 OK`

---

### Patients

#### GET `/api/patients` (List Patients)
- **URL:** `http://localhost:3002/api/patients?page=1&limit=10`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${AUTH0_M2M_TOKEN}
Content-Type: application/json
```
- **Query Parameters:**
  - `page` (int): `1`
  - `limit` (int): `10`
  - `status` (optional): `ACTIVE` | `INACTIVE` | `DECEASED`
  - `search` (optional, string): Search string
- **Expected Response:** `200 OK`

#### POST `/api/patients` (Create Patient)
- **URL:** `http://localhost:3002/api/patients`
- **Method:** `POST`
- **Headers:**
```
Authorization: Bearer ${AUTH0_M2M_TOKEN}
Content-Type: application/json
```
- **Body:**
```json
{
  "hospitalNumber": "P2024999",
  "firstName": "Test",
  "lastName": "Patient",
  "dateOfBirth": "1985-03-20",
  "gender": "MALE",
  "email": "test.patient@example.com",
  "phone": "0612345678",
  "address": "Test Street 123",
  "city": "Amsterdam",
  "zipCode": "1234 AB",
  "status": "ACTIVE"
}
```
- **Expected Response:** `201 Created`

---

### Other EPD Endpoints

All following endpoints use Auth0 M2M authentication and follow similar patterns:

- **Encounters:** `/api/encounters`
- **Medications:** `/api/medications`
- **Allergies:** `/api/allergies`
- **Vitals:** `/api/vitals`
- **Lab Results:** `/api/lab-results`
- **Appointments:** `/api/appointments`
- **Insurance:** `/api/insurance/insurers`, `/api/insurance/policies`

---

## 3?? Mail Service (Port 3001)

### Health Check

#### GET `/health`
- **URL:** `http://localhost:3001/health`
- **Method:** `GET`
- **Headers:** None required
- **Expected Response:** `200 OK`
```json
{
  "status": "ok",
  "service": "mail-service"
}
```

---

### Mail Endpoints

#### GET `/api/mails/user/{userId}/count`
- **URL:** `http://localhost:3001/api/mails/user/user123/count`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${M2M_TOKEN}
Content-Type: application/json
```
- **Expected Response:** `200 OK`
```json
{
  "unreadCount": 3,
  "totalCount": 15
}
```

#### GET `/api/mails/user/{userId}` (List User Mails)
- **URL:** `http://localhost:3001/api/mails/user/user123`
- **Method:** `GET`
- **Headers:**
```
Authorization: Bearer ${M2M_TOKEN}
Content-Type: application/json
```
- **Expected Response:** `200 OK`

#### POST `/api/mails/` (Create Mail)
- **URL:** `http://localhost:3001/api/mails`
- **Method:** `POST`
- **Headers:**
```
Authorization: Bearer ${M2M_TOKEN}
Content-Type: application/json
```
- **Body:**
```json
{
  "userId": "user123",
  "from": "system@hospital.com",
  "to": "patient@example.com",
  "subject": "Appointment Reminder",
  "body": "This is a reminder for your upcoming appointment..."
}
```
- **Expected Response:** `201 Created`

---

## ?? Automated Testing

### Setup

1. **Navigate to test directory:**
```bash
cd util/development-requests/raw
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your Auth0 credentials
```

4. **Run tests:**
```bash
npm run test:endpoints
```

### Output

The test suite will:
- ? Test health checks (no auth required)
- ?? Get Auth0 M2M token
- ?? Test authenticated endpoints
- ?? Display color-coded results
- ?? Save report to `TEST_REPORT.md`

---

## ?? Notes

- All timestamps should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- All authenticated endpoints require `Authorization: Bearer <token>` header
- EPD backend has Swagger documentation at `http://localhost:3002/api-docs`
- Mail service userId format is string-based (not integer)
- Ensure Docker containers are running before testing: `docker ps`

---

## ?? Common Issues

1. **401 Unauthorized**: Check token is valid and not expired
2. **404 Not Found**: Verify the service is running on correct port
3. **CORS Errors**: Ensure CORS is properly configured in backends
4. **Connection Refused**: Check Docker containers are up: `docker ps`
5. **Invalid JSON**: Ensure `Content-Type: application/json` header is set

---

For quick setup instructions, see `TESTING_QUICKSTART.md`
