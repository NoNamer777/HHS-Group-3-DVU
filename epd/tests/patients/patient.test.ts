import request from 'supertest';
import express from 'express';
import patientRoutes from '../../backend/src/routes/patient.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/patients', patientRoutes);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';

describe('Patient API - Auth0 M2M', () => {
  let authToken: string;
  let createdPatientId: number;

  beforeAll(async () => {
    // Get Auth0 M2M token
    authToken = await getAuth0Token();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient with valid Auth0 token', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-15',
          sex: 'MALE',
          hospitalNumber: `HN-TEST-${Date.now()}`,
          phone: '+31612345678',
          email: 'john.doe@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
      expect(response.body.sex).toBe('MALE');

      createdPatientId = response.body.id;
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1995-05-20',
          sex: 'FEMALE',
          hospitalNumber: `HN-NOAUTH-${Date.now()}`
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', 'Bearer invalid-token-12345')
        .send({
          firstName: 'Invalid',
          lastName: 'Token',
          dateOfBirth: '1985-03-10',
          sex: 'OTHER',
          hospitalNumber: `HN-INVALID-${Date.now()}`
        });

      expect(response.status).toBe(401);
    });

    it('should reject duplicate hospital number', async () => {
      const hospitalNumber = `HN-DUP-${Date.now()}`;

      // Create first patient
      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'First',
          lastName: 'Patient',
          dateOfBirth: '1980-01-01',
          sex: 'MALE',
          hospitalNumber
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Second',
          lastName: 'Patient',
          dateOfBirth: '1985-01-01',
          sex: 'FEMALE',
          hospitalNumber // Same hospital number
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/patients', () => {
    it('should get all patients with valid token', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('patients');
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(401);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/patients')
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('patients');
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body.patients.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should get patient by id with valid token', async () => {
      // First create a patient
      const createResponse = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'GetById',
          lastName: 'Test',
          dateOfBirth: '1992-06-15',
          sex: 'FEMALE',
          hospitalNumber: `HN-GETBYID-${Date.now()}`
        });

      const patientId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(patientId);
      expect(response.body.firstName).toBe('GetById');
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/patients/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/patients/1');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update patient with valid token', async () => {
      // Create patient first
      const createResponse = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Original',
          lastName: 'Name',
          dateOfBirth: '1988-08-08',
          sex: 'MALE',
          hospitalNumber: `HN-UPDATE-${Date.now()}`
        });

      const patientId = createResponse.body.id;

      // Update patient
      const response = await request(app)
        .put(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+31687654321'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
      expect(response.body.phone).toBe('+31687654321');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/patients/1')
        .send({ firstName: 'Hacker' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('should delete patient with valid token', async () => {
      // Create patient first
      const createResponse = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'ToDelete',
          lastName: 'Patient',
          dateOfBirth: '1975-12-25',
          sex: 'OTHER',
          hospitalNumber: `HN-DELETE-${Date.now()}`
        });

      const patientId = createResponse.body.id;

      // Delete patient
      const response = await request(app)
        .delete(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/patients/1');

      expect(response.status).toBe(401);
    });
  });
});
