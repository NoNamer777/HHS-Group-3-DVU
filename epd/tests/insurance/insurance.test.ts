import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import insuranceRoutes from '../../backend/src/routes/insurance.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/insurance', insuranceRoutes);

describe('Insurance API', () => {
  let authToken: string;
  let testPatient: any;
  let testInsurer: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `insurance-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Insurance',
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
        firstName: 'Insurance',
        lastName: 'Patient',
        dateOfBirth: '1990-11-20T00:00:00.000Z',
        sex: 'MALE',
        email: `insurance-patient-${Date.now()}@example.com`,
        phone: '+31687654321',
        addressLine1: 'Insurance Lane 40',
        city: 'Maastricht',
        postalCode: '6200AA',
        hospitalNumber: `INS-${Date.now()}`
      });

    testPatient = patientResponse.body;
  });

  describe('Insurer Management', () => {
    describe('POST /api/insurance/insurers', () => {
      it('should create a new insurer', async () => {
        const response = await request(app)
          .post('/api/insurance/insurers')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Test Insurance Co ${Date.now()}`,
            code: `TIC${Date.now()}`,
            address: 'Insurer Street 100',
            city: 'Amsterdam',
            postalCode: '1000ZZ',
            country: 'Netherlands',
            phone: '+31201234567',
            email: `test-insurer-${Date.now()}@insurance.nl`
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toContain('Test Insurance Co');
        testInsurer = response.body;
      });

      it('should fail without authentication', async () => {
        const response = await request(app)
          .post('/api/insurance/insurers')
          .send({
            name: 'Unauthorized Insurer',
            code: 'UNAUTH',
            phone: '+31201111111',
            email: 'unauth@insurance.nl'
          });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/insurance/insurers', () => {
      it('should list all insurers', async () => {
        const response = await request(app)
          .get('/api/insurance/insurers')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('insurers');
        expect(Array.isArray(response.body.insurers)).toBe(true);
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/insurance/insurers?page=1&limit=5')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination.limit).toBe(5);
      });
    });

    describe('GET /api/insurance/insurers/:id', () => {
      it('should get insurer by id', async () => {
        const response = await request(app)
          .get(`/api/insurance/insurers/${testInsurer.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(testInsurer.id);
      });

      it('should return 404 for non-existent insurer', async () => {
        const response = await request(app)
          .get('/api/insurance/insurers/999999')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/insurance/insurers/:id', () => {
      it('should update insurer details', async () => {
        const response = await request(app)
          .put(`/api/insurance/insurers/${testInsurer.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            phone: '+31209999999',
            email: 'updated@insurance.nl'
          });

        expect(response.status).toBe(200);
        expect(response.body.phone).toBe('+31209999999');
        expect(response.body.email).toBe('updated@insurance.nl');
      });
    });
  });

  describe('Insurance Policy Management', () => {
    describe('POST /api/insurance/policies', () => {
      it('should create a new insurance policy', async () => {
        const response = await request(app)
          .post('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: `POL-${Date.now()}`,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE',
            coverageType: 'COMPREHENSIVE'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.patientId).toBe(testPatient.id);
        expect(response.body.status).toBe('ACTIVE');
      });

      it('should fail without authentication', async () => {
        const response = await request(app)
          .post('/api/insurance/policies')
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: 'POL-UNAUTH',
            status: 'ACTIVE'
          });

        expect(response.status).toBe(401);
      });

      it('should create policy with end date', async () => {
        const response = await request(app)
          .post('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: `POL-ENDDATE-${Date.now()}`,
            startDate: new Date().toISOString(),
            status: 'ACTIVE',
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          });

        expect(response.status).toBe(201);
        expect(response.body.policyNumber).toContain('POL-ENDDATE-');
        expect(response.body.endDate).toBeDefined();
      });
    });

    describe('GET /api/insurance/policies', () => {
      it('should list all policies', async () => {
        const response = await request(app)
          .get('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('policies');
        expect(Array.isArray(response.body.policies)).toBe(true);
      });

      it('should filter policies by patientId', async () => {
        const response = await request(app)
          .get(`/api/insurance/policies?patientId=${testPatient.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.policies.every((p: any) => p.patientId === testPatient.id)).toBe(true);
      });

      it('should filter policies by status', async () => {
        const response = await request(app)
          .get('/api/insurance/policies?status=ACTIVE')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.policies.every((p: any) => p.status === 'ACTIVE')).toBe(true);
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/insurance/policies?page=1&limit=5')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination.limit).toBe(5);
      });
    });

    describe('GET /api/insurance/policies/:id', () => {
      it('should get policy by id', async () => {
        const createResponse = await request(app)
          .post('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: `POL-GET-${Date.now()}`,
            startDate: new Date().toISOString(),
            status: 'ACTIVE'
          });

        const response = await request(app)
          .get(`/api/insurance/policies/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createResponse.body.id);
        expect(response.body.policyNumber).toContain('POL-GET-');
      });

      it('should return 404 for non-existent policy', async () => {
        const response = await request(app)
          .get('/api/insurance/policies/999999')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/insurance/policies/:id', () => {
      it('should update policy status', async () => {
        const createResponse = await request(app)
          .post('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: `POL-UPDATE-${Date.now()}`,
            startDate: new Date().toISOString(),
            status: 'ACTIVE'
          });

        const response = await request(app)
          .put(`/api/insurance/policies/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'ENDED'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ENDED');
      });

      it('should extend policy end date', async () => {
        const createResponse = await request(app)
          .post('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: `POL-EXTEND-${Date.now()}`,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE',
            coverageType: 'COMPREHENSIVE'
          });

        const newEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const response = await request(app)
          .put(`/api/insurance/policies/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            endDate: newEndDate.toISOString()
          });

        expect(response.status).toBe(200);
        expect(new Date(response.body.endDate).getTime()).toBe(newEndDate.getTime());
      });
    });

    describe('DELETE /api/insurance/policies/:id', () => {
      it('should delete policy', async () => {
        const createResponse = await request(app)
          .post('/api/insurance/policies')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patientId: testPatient.id,
            insurerId: testInsurer.id,
            policyNumber: `POL-DELETE-${Date.now()}`,
            startDate: new Date().toISOString(),
            status: 'ENDED'
          });

        const deleteResponse = await request(app)
          .delete(`/api/insurance/policies/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toContain('deleted');

        const getResponse = await request(app)
          .get(`/api/insurance/policies/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(404);
      });
    });
  });
});
