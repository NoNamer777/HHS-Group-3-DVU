import request from 'supertest';
import express from 'express';
import patientRoutes from '../../backend/src/routes/patient.routes';
import authRoutes from '../../backend/src/routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

describe('Patient API', () => {
  let authToken: string;
  let createdPatientId: number;

  beforeAll(async () => {
    // Create and login test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Patient',
        lastName: 'Tester',
        email: `patienttest${Date.now()}@example.com`,
        password: 'password123',
        role: 'DOCTOR'
      });

    authToken = registerResponse.body.token;

    // Create a test patient for use in GET/PUT/DELETE tests
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Shared',
        lastName: 'TestPatient',
        dateOfBirth: '1985-05-15',
        sex: 'FEMALE',
        hospitalNumber: `HN-SHARED-${Date.now()}`
      });

    createdPatientId = patientResponse.body.id;
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          sex: 'MALE',
          hospitalNumber: `HP-CREATE-${Date.now()}`,
          email: 'john.doe@example.com',
          phone: '0612345678',
          addressLine1: 'Test Street 123',
          city: 'Amsterdam',
          postalCode: '1000AA',
          status: 'ACTIVE'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send({
          firstName: 'New',
          lastName: 'Patient',
          dateOfBirth: '1995-05-15',
          sex: 'MALE',
          hospitalNumber: 'HP999'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if hospital number already exists', async () => {
      const hospitalNumber = `HN${Date.now()}`;

      // Create first patient
      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hospitalNumber,
          firstName: 'First',
          lastName: 'Patient',
          dateOfBirth: '1990-01-01',
          sex: 'MALE'
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hospitalNumber,
          firstName: 'Second',
          lastName: 'Patient',
          dateOfBirth: '1990-01-01',
          sex: 'MALE'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Hospital number already exists');
    });
  });

  describe('GET /api/patients', () => {
    it('should return list of patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('patients');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(Array.isArray(response.body.patients)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/patients?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/patients?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('patients');
    });

    it('should search patients', async () => {
      const response = await request(app)
        .get('/api/patients?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('patients');
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should return patient by id', async () => {
      const response = await request(app)
        .get(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdPatientId);
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/patients/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Patient not found');
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update patient', async () => {
      const response = await request(app)
        .put(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '0687654321',
          city: 'Rotterdam'
        });

      expect(response.status).toBe(200);
      expect(response.body.phone).toBe('0687654321');
      expect(response.body.city).toBe('Rotterdam');
    });
  });

  describe('DELETE /api/patients/:id', () => {
    let deletePatientId: number;

    beforeAll(async () => {
      // Create a fresh patient specifically for deletion test
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Delete',
          lastName: 'Me',
          dateOfBirth: '1990-01-01',
          sex: 'MALE',
          hospitalNumber: `HN-DELETE-${Date.now()}`
        });
      
      deletePatientId = response.body.id;
    });

    it('should delete patient', async () => {
      const response = await request(app)
        .delete(`/api/patients/${deletePatientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Patient deleted');
    });

    it('should return 404 after deletion', async () => {
      const response = await request(app)
        .get(`/api/patients/${deletePatientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
