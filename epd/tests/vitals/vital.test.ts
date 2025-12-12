import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import vitalRoutes from '../../backend/src/routes/vital.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/vitals', vitalRoutes);

describe('Vital Signs API', () => {
  let authToken: string;
  let testPatient: any;
  let testEncounter: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `vital-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Vital',
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
        firstName: 'Vital',
        lastName: 'Patient',
        dateOfBirth: '1980-12-25T00:00:00.000Z',
        sex: 'MALE',
        email: `vital-patient-${Date.now()}@example.com`,
        phone: '+31687654321',
        addressLine1: 'Vital Avenue 20',
        city: 'The Hague',
        postalCode: '2500AA',
        hospitalNumber: `VIT-${Date.now()}`
      });

    testPatient = patientResponse.body;

    // Create test encounter
    const encounterResponse = await request(app)
      .post('/api/encounters')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientId: testPatient.id,
        type: 'EMERGENCY',
        status: 'IN_PROGRESS',
        startDate: new Date().toISOString(),
        chiefComplaint: 'Vital signs monitoring'
      });

    testEncounter = encounterResponse.body;
  });

  describe('POST /api/vitals', () => {
    it('should create a new vital signs record', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          type: 'TEMPERATURE',
          value: '37.2',
          unit: '°C',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('TEMPERATURE');
      expect(response.body.value).toBe('37.2');
      expect(response.body.unit).toBe('°C');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .send({
          patientId: testPatient.id,
          type: 'HEART_RATE',
          value: '90',
          unit: 'bpm'
        });

      expect(response.status).toBe(401);
    });

    it('should create vitals without unit', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          type: 'HEART_RATE',
          value: '68'
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('HEART_RATE');
      expect(response.body.value).toBe('68');
    });

    it('should create blood pressure vital', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          type: 'BLOOD_PRESSURE',
          value: '120/80',
          unit: 'mmHg',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('BLOOD_PRESSURE');
      expect(response.body.value).toBe('120/80');
    });
  });

  describe('GET /api/vitals', () => {
    it('should list all vital signs', async () => {
      const response = await request(app)
        .get('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vitals');
      expect(Array.isArray(response.body.vitals)).toBe(true);
    });

    it('should filter vitals by patientId', async () => {
      const response = await request(app)
        .get(`/api/vitals?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.vitals.every((v: any) => v.patientId === testPatient.id)).toBe(true);
    });

    it('should filter vitals by type', async () => {
      const response = await request(app)
        .get(`/api/vitals?type=TEMPERATURE`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.vitals)).toBe(true);
    });

    it('should support date range filtering', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/vitals?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.vitals)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/vitals?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/vitals/:id', () => {
    it('should get vital signs by id', async () => {
      const createResponse = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          type: 'OXYGEN_SAT',
          value: '99',
          unit: '%',
          measuredAt: new Date().toISOString()
        });

      const response = await request(app)
        .get(`/api/vitals/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.type).toBe('OXYGEN_SAT');
      expect(response.body.value).toBe('99');
    });

    it('should return 404 for non-existent vital signs', async () => {
      const response = await request(app)
        .get('/api/vitals/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/vitals/:id', () => {
    it('should update vital signs', async () => {
      const createResponse = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          type: 'TEMPERATURE',
          value: '37.5',
          unit: '°C'
        });

      const response = await request(app)
        .put(`/api/vitals/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          value: '37.3'
        });

      expect(response.status).toBe(200);
      expect(response.body.value).toBe('37.3');
      expect(response.body.type).toBe('TEMPERATURE');
    });
  });

  describe('DELETE /api/vitals/:id', () => {
    it('should delete vital signs record', async () => {
      const createResponse = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          type: 'RESPIRATORY_RATE',
          value: '16',
          unit: 'breaths/min'
        });

      const deleteResponse = await request(app)
        .delete(`/api/vitals/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toContain('deleted');

      const getResponse = await request(app)
        .get(`/api/vitals/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
