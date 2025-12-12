import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import diagnosisRoutes from '../../backend/src/routes/diagnosis.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/diagnoses', diagnosisRoutes);

describe('Diagnosis API', () => {
  let authToken: string;
  let testPatient: any;
  let testEncounter: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const testEmail = `diagnosis-test-${Date.now()}@example.com`;
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        firstName: 'Diagnosis',
        lastName: 'Tester',
        role: 'DOCTOR'
      });

    expect(userResponse.status).toBe(201);
    authToken = userResponse.body.accessToken;

    // Create test patient
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Diagnosis',
        lastName: 'Patient',
        dateOfBirth: '1990-05-15T00:00:00.000Z',
        sex: 'MALE',
        email: `diagnosis-patient-${Date.now()}@example.com`,
        phone: '+31612345678',
        addressLine1: 'Test Street 1',
        city: 'Amsterdam',
        postalCode: '1000AA',
        hospitalNumber: `DIA-${Date.now()}`
      });

    testPatient = patientResponse.body;

    // Create test encounter
    const encounterResponse = await request(app)
      .post('/api/encounters')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientId: testPatient.id,
        type: 'OUTPATIENT',
        status: 'IN_PROGRESS',
        startDate: new Date().toISOString(),
        chiefComplaint: 'Diagnosis test encounter'
      });

    testEncounter = encounterResponse.body;
  });

  describe('POST /api/diagnoses', () => {
    it('should create a new diagnosis', async () => {
      const response = await request(app)
        .post('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          code: 'J06.9',
          description: 'Acute upper respiratory infection, unspecified',
          type: 'PRIMARY'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.code).toBe('J06.9');
      expect(response.body.type).toBe('PRIMARY');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/diagnoses')
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          code: 'I10',
          description: 'Essential hypertension',
          type: 'SECONDARY'
        });

      expect(response.status).toBe(401);
    });

    it('should create diagnosis with notes', async () => {
      const response = await request(app)
        .post('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          code: 'E11.9',
          description: 'Type 2 diabetes mellitus without complications',
          type: 'SECONDARY',
          onset: new Date('2024-01-01').toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.onset).toBeDefined();
    });
  });

  describe('GET /api/diagnoses', () => {
    it('should list all diagnoses', async () => {
      const response = await request(app)
        .get('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('diagnoses');
      expect(Array.isArray(response.body.diagnoses)).toBe(true);
    });

    it('should filter diagnoses by patientId', async () => {
      const response = await request(app)
        .get(`/api/diagnoses?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.diagnoses.every((d: any) => d.patientId === testPatient.id)).toBe(true);
    });

    it('should filter diagnoses by encounterId', async () => {
      const response = await request(app)
        .get(`/api/diagnoses?encounterId=${testEncounter.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.diagnoses.every((d: any) => d.encounterId === testEncounter.id)).toBe(true);
    });

    it('should filter diagnoses by type', async () => {
      const response = await request(app)
        .get('/api/diagnoses?type=PRIMARY')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.diagnoses)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/diagnoses?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/diagnoses/:id', () => {
    it('should get diagnosis by id', async () => {
      const createResponse = await request(app)
        .post('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          code: 'M54.5',
          description: 'Low back pain',
          type: 'PRIMARY'
        });

      const response = await request(app)
        .get(`/api/diagnoses/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.code).toBe('M54.5');
    });

    it('should return 404 for non-existent diagnosis', async () => {
      const response = await request(app)
        .get('/api/diagnoses/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/diagnoses/:id', () => {
    it('should update diagnosis', async () => {
      const createResponse = await request(app)
        .post('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          code: 'R50.9',
          description: 'Fever, unspecified',
          type: 'PRIMARY'
        });

      const response = await request(app)
        .put(`/api/diagnoses/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          resolved: new Date().toISOString(),
          description: 'Fever resolved after treatment'
        });

      expect(response.status).toBe(200);
      expect(response.body.resolved).toBeDefined();
      expect(response.body.description).toBe('Fever resolved after treatment');
    });
  });

  describe('DELETE /api/diagnoses/:id', () => {
    it('should delete diagnosis', async () => {
      const createResponse = await request(app)
        .post('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          code: 'Z00.0',
          description: 'General medical examination',
          type: 'SECONDARY'
        });

      const deleteResponse = await request(app)
        .delete(`/api/diagnoses/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Diagnosis deleted');

      const getResponse = await request(app)
        .get(`/api/diagnoses/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
