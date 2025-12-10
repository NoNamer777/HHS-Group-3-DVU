import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import medicationRoutes from '../../backend/src/routes/medication.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/medications', medicationRoutes);

describe('Medication API', () => {
  let authToken: string;
  let testPatient: any;
  let testEncounter: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `medication-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Medication',
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
        firstName: 'Medication',
        lastName: 'Patient',
        dateOfBirth: '1985-03-20T00:00:00.000Z',
        sex: 'FEMALE',
        email: `medication-patient-${Date.now()}@example.com`,
        phone: '+31687654321',
        addressLine1: 'Medication Lane 10',
        city: 'Rotterdam',
        postalCode: '3000AA',
        hospitalNumber: `MED-${Date.now()}`
      });

    testPatient = patientResponse.body;

    // Create test encounter
    const encounterResponse = await request(app)
      .post('/api/encounters')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientId: testPatient.id,
        type: 'INPATIENT',
        status: 'IN_PROGRESS',
        startDate: new Date().toISOString(),
        chiefComplaint: 'Medication test encounter'
      });

    testEncounter = encounterResponse.body;
  });

  describe('POST /api/medications', () => {
    it('should create a new medication order', async () => {
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Paracetamol',
          dose: '500mg',
          frequency: 'Every 6 hours',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.medicationName).toBe('Paracetamol');
      expect(response.body.route).toBe('ORAL');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/medications')
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Ibuprofen',
          dose: '400mg',
          frequency: 'Twice daily',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      expect(response.status).toBe(401);
    });

    it('should create medication with end date', async () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Amoxicillin',
          dose: '250mg',
          frequency: 'Three times daily',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          endDate: endDate.toISOString(),
          status: 'ACTIVE'
        });

      expect(response.status).toBe(201);
      expect(response.body.endDate).toBeDefined();
    });
  });

  describe('GET /api/medications', () => {
    it('should list all medications', async () => {
      const response = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('medications');
      expect(Array.isArray(response.body.medications)).toBe(true);
    });

    it('should filter medications by patientId', async () => {
      const response = await request(app)
        .get(`/api/medications?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.medications.every((m: any) => m.patientId === testPatient.id)).toBe(true);
    });

    it('should filter medications by status', async () => {
      const response = await request(app)
        .get('/api/medications?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.medications.every((m: any) => m.status === 'ACTIVE')).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/medications?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/medications/:id', () => {
    it('should get medication by id', async () => {
      const createResponse = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Metformin',
          dose: '500mg',
          frequency: 'Twice daily',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      const response = await request(app)
        .get(`/api/medications/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.medicationName).toBe('Metformin');
    });

    it('should return 404 for non-existent medication', async () => {
      const response = await request(app)
        .get('/api/medications/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/medications/:id', () => {
    it('should update medication status', async () => {
      const createResponse = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Lisinopril',
          dose: '10mg',
          frequency: 'Once daily',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      const response = await request(app)
        .put(`/api/medications/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
          endDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.endDate).toBeDefined();
    });

    it('should update medication dosage', async () => {
      const createResponse = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Aspirin',
          dose: '75mg',
          frequency: 'Once daily',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      const response = await request(app)
        .put(`/api/medications/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dose: '100mg'
        });

      expect(response.status).toBe(200);
      expect(response.body.dose).toBe('100mg');
    });
  });

  describe('DELETE /api/medications/:id', () => {
    it('should delete medication', async () => {
      const createResponse = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          encounterId: testEncounter.id,
          medicationName: 'Omeprazole',
          dose: '20mg',
          frequency: 'Once daily',
          route: 'ORAL',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      const deleteResponse = await request(app)
        .delete(`/api/medications/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toContain('deleted');

      const getResponse = await request(app)
        .get(`/api/medications/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
