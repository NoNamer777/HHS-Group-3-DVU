import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import allergyRoutes from '../../backend/src/routes/allergy.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/allergies', allergyRoutes);

describe('Allergy API', () => {
  let authToken: string;
  let testPatient: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `allergy-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Allergy',
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
        firstName: 'Allergy',
        lastName: 'Patient',
        dateOfBirth: '1992-08-10T00:00:00.000Z',
        sex: 'FEMALE',
        email: `allergy-patient-${Date.now()}@example.com`,
        phone: '+31698765432',
        addressLine1: 'Allergy Street 5',
        city: 'Utrecht',
        postalCode: '3500AA',
        hospitalNumber: `ALG-${Date.now()}`
      });

    testPatient = patientResponse.body;
  });

  describe('POST /api/allergies', () => {
    it('should create a new allergy record', async () => {
      const response = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          substance: 'Penicillin',
          severity: 'SEVERE',
          reaction: 'Anaphylaxis',
          status: 'ACTIVE',
          diagnosedAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.substance).toBe('Penicillin');
      expect(response.body.severity).toBe('SEVERE');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/allergies')
        .send({
          patientId: testPatient.id,
          substance: 'Peanuts',
          severity: 'MODERATE',
          reaction: 'Hives',
          status: 'ACTIVE',
          diagnosedAt: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });

    it('should create allergy with notes', async () => {
      const response = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          substance: 'Latex',
          severity: 'MILD',
          reaction: 'Skin irritation',
          status: 'ACTIVE',
          diagnosedAt: new Date().toISOString(),
          notes: 'Patient reports mild itching when wearing latex gloves'
        });

      expect(response.status).toBe(201);
      
    });
  });

  describe('GET /api/allergies', () => {
    it('should list all allergies', async () => {
      const response = await request(app)
        .get('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('allergies');
      expect(Array.isArray(response.body.allergies)).toBe(true);
    });

    it('should filter allergies by patientId', async () => {
      const response = await request(app)
        .get(`/api/allergies?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.allergies.every((a: any) => a.patientId === testPatient.id)).toBe(true);
    });





    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/allergies?page=1&limit=3')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(3);
    });
  });

  describe('GET /api/allergies/:id', () => {
    it('should get allergy by id', async () => {
      const createResponse = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          substance: 'Shellfish',
          severity: 'MODERATE',
          reaction: 'Swelling and difficulty breathing',
          status: 'ACTIVE',
          diagnosedAt: new Date().toISOString()
        });

      const response = await request(app)
        .get(`/api/allergies/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.substance).toBe('Shellfish');
    });

    it('should return 404 for non-existent allergy', async () => {
      const response = await request(app)
        .get('/api/allergies/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/allergies/:id', () => {
    it('should update allergy reaction', async () => {
      const createResponse = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          substance: 'Dust mites',
          severity: 'MILD',
          reaction: 'Sneezing and runny nose'
        });

      const response = await request(app)
        .put(`/api/allergies/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reaction: 'Symptoms improved after immunotherapy - now resolved'
        });

      expect(response.status).toBe(200);
      expect(response.body.reaction).toContain('resolved');
      expect(response.body.substance).toBe('Dust mites');
      
    });

    it('should update severity level', async () => {
      const createResponse = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          substance: 'Pollen',
          severity: 'MILD',
          reaction: 'Mild sneezing'
        });

      const response = await request(app)
        .put(`/api/allergies/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          severity: 'MODERATE',
          reaction: 'Increased sneezing and itchy eyes'
        });

      expect(response.status).toBe(200);
      expect(response.body.severity).toBe('MODERATE');
    });
  });

  describe('DELETE /api/allergies/:id', () => {
    it('should delete allergy', async () => {
      const createResponse = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          substance: 'Aspirin',
          severity: 'MODERATE',
          reaction: 'Stomach upset',
          status: 'ACTIVE',
          diagnosedAt: new Date().toISOString()
        });

      const deleteResponse = await request(app)
        .delete(`/api/allergies/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toContain('deleted');

      const getResponse = await request(app)
        .get(`/api/allergies/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
