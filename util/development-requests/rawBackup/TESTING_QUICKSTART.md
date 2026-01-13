# API Testing Quick Start Guide

This guide helps you quickly set up and run the automated endpoint tests.

## ?? Quick Start (5 minutes)

### 1. Navigate to Testing Directory
```bash
cd util/development-requests/raw
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your Auth0 credentials (ask your team lead):
```env
AUTH0_ISSUER_BASE_URL=https://diabeticum-pedis.eu.auth0.com
AUTH0_CLIENT_ID=your-m2m-client-id
AUTH0_CLIENT_SECRET=your-m2m-client-secret
AUTH0_AUDIENCE=https://api.epd-service.local
```

### 4. Start All Services

Make sure these are running:

**FastAPI Backend:**
```bash
cd ../../../backend
docker compose up -d
# or
python -m uvicorn project.main:app --reload --port 8000
```

**EPD Backend:**
```bash
cd ../../../epd
docker compose up -d
# or
npm install && npm run dev
```

**Mail Service:**
```bash
cd ../../../mail
docker compose up -d
# or
npm install && npm run dev
```

### 5. Run Tests
```bash
cd util/development-requests/raw
npm run test:endpoints
```

## ?? Understanding Results

### Console Output

- ? **Green checkmark** = Endpoint working correctly
- ? **Red X** = Endpoint failed (service down or error)
- ? **Yellow circle** = Endpoint skipped (no auth token)

### Report File

After tests complete, check `TEST_REPORT.md` for:
- Detailed results per service
- Response times
- Error messages
- Success rate statistics

## ?? Troubleshooting

### "Connection refused" errors
**Problem:** Service not running  
**Solution:** 
```bash
# Check what's running
docker ps

# Or check processes
lsof -i :8000  # FastAPI
lsof -i :3002  # EPD
lsof -i :3001  # Mail
```

### "Missing Auth0 credentials"
**Problem:** `.env` file not configured  
**Solution:** 
1. Copy `.env.example` to `.env`
2. Fill in Auth0 credentials
3. Verify credentials in Auth0 Dashboard

### All authenticated endpoints skipped
**Problem:** Auth0 token request failed  
**Solution:**
1. Check Auth0 credentials are correct
2. Verify M2M application is authorized for the API
3. Check network connectivity to Auth0

### Specific endpoint failing
**Problem:** Individual endpoint has issues  
**Solution:**
1. Check the error message in console
2. Look at `TEST_REPORT.md` for details
3. Test manually with curl or Postman
4. Check service logs

## ?? What Gets Tested

### FastAPI Backend (Port 8000)
- Health check (`/`)
- Authentication (`/auth/login/`)
- Patients endpoints
- Encounters endpoints
- Mails endpoints

### EPD Backend (Port 3002)
- Health check (`/health`)
- Users endpoints
- Patients endpoints
- Encounters, medications, allergies
- Vitals, lab results, appointments
- Insurance endpoints

### Mail Service (Port 3001)
- Health check (`/health`)
- Mail count endpoint
- User mails endpoint

## ?? Next Steps

- **For JMeter testing:** See `API_TESTING_GUIDE.md`
- **For development:** Check individual service READMEs
- **For CI/CD:** Integrate `npm run test:endpoints` into your pipeline

## ?? Tips

1. **Run tests regularly** to catch issues early
2. **Check TEST_REPORT.md** for historical data
3. **Use with CI/CD** to automate testing
4. **Compare reports** over time to track improvements

## ?? Need Help?

- Check service-specific documentation in each folder
- Review Auth0 setup in `../../../epd/docs/AUTHENTICATION.md`
- Ask your team lead for Auth0 credentials
- Check the main project README for more info
