import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import labResultRoutes from '../../backend/src/routes/labResult.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/lab-results', labResultRoutes);

describe('Lab Results API', () => {
  let authToken: string;
  let testPatient: any;
  let testEncounter: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `lab-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Lab',
        lastName: 'Tester',
        role: 'DOCTOR'
      });

    expect(userResponse.status).toBe(201);
    authToken = userResponse.body.token;

    // Create test patient
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Lab',
        lastName: 'Patient',
        dateOfBirth: '1975-06-30T00:00:00.000Z',
        sex: 'MALE',
        email: `lab-patient-${Date.now()}@example.com`,
        phone: '+31612345678',
        addressLine1: 'Lab Street 15',
        city: 'Eindhoven',
        postalCode: '5600AA',
        hospitalNumber: `LAB-${Date.now()}`
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
        chiefComplaint: 'Lab work needed'
      });

    testEncounter = encounterResponse.body;
  });

  describe('POST /api/lab-results', () => {
    it('should create a new lab result', async () => {
      const response = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'Hemoglobin',
          status: 'FINAL',
          value: '14.5',
          unit: 'g/dL',
          referenceRange: '13-17 g/dL'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.testName).toBe('Hemoglobin');
      expect(response.body.value).toBe('14.5');
      expect(response.body.unit).toBe('g/dL');
      
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/lab-results')
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'Lipid Panel',
          status: 'REGISTERED'
        });

      expect(response.status).toBe(401);
    });

    it('should create lab result with reference range', async () => {
      const response = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'TSH',
          status: 'FINAL',
          value: '2.5',
          unit: 'mIU/L',
          referenceRange: '0.4-4.0 mIU/L'
        });

      expect(response.status).toBe(201);
      expect(response.body.referenceRange).toBe('0.4-4.0 mIU/L');
      
    });
  });

  describe('GET /api/lab-results', () => {
    it('should list all lab results', async () => {
      const response = await request(app)
        .get('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('labResults');
      expect(Array.isArray(response.body.labResults)).toBe(true);
    });

    it('should filter lab results by patientId', async () => {
      const response = await request(app)
        .get(`/api/lab-results?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.labResults.every((lr: any) => lr.patientId === testPatient.id)).toBe(true);
    });

    it('should filter lab results by status', async () => {
      const response = await request(app)
        .get('/api/lab-results?status=FINAL')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.labResults.every((lr: any) => lr.status === 'FINAL')).toBe(true);
    });



    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/lab-results?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/lab-results/:id', () => {
    it('should get lab result by id', async () => {
      const createResponse = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'Blood Glucose',
          testCode: 'GLU',
          category: 'CHEMISTRY',
          status: 'FINAL',
          orderedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          results: {
            glucose: '95'
          }
        });

      const response = await request(app)
        .get(`/api/lab-results/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.testName).toBe('Blood Glucose');
    });

    it('should return 404 for non-existent lab result', async () => {
      const response = await request(app)
        .get('/api/lab-results/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/lab-results/:id', () => {
    it('should update lab result status', async () => {
      const createResponse = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'Urinalysis',
          status: 'REGISTERED'
        });

      const response = await request(app)
        .put(`/api/lab-results/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FINAL',
          reportedAt: new Date().toISOString(),
          value: 'Normal',
          referenceRange: 'Negative'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('FINAL');
      expect(response.body.value).toBe('Normal');
    });

    it('should update reference range on lab result', async () => {
      const createResponse = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'ALT',
          status: 'FINAL',
          value: '35',
          unit: 'U/L',
          referenceRange: '7-56 U/L'
        });

      const response = await request(app)
        .put(`/api/lab-results/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          referenceRange: '7-56 U/L (within normal limits)'
        });

      expect(response.status).toBe(200);
      expect(response.body.referenceRange).toContain('within normal limits');
      
    });
  });

  describe('DELETE /api/lab-results/:id', () => {
    it('should delete lab result', async () => {
      const createResponse = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          testName: 'Chest X-Ray',
          status: 'REGISTERED'
        });

      const deleteResponse = await request(app)
        .delete(`/api/lab-results/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toContain('deleted');

      const getResponse = await request(app)
        .get(`/api/lab-results/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
