import request from 'supertest';
import express from 'express';
import medicationRoutes from '../../backend/src/routes/medication.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/medications', medicationRoutes);

describe('Medication API - Auth0 M2M', () => {
  let authToken: string;
  let createdMedicationId: number;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/medications', () => {
    it('should create medication order with valid token', async () => {
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          medicationName: 'Metformin',
          dose: '500mg',
          route: 'Oral',
          frequency: '2x daily',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.medicationName).toBe('Metformin');
      expect(response.body.dose).toBe('500mg');
      createdMedicationId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/medications')
        .send({
          patientId: 1,
          medicationName: 'Aspirin',
          dose: '100mg',
          startDate: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/medications', () => {
    it('should list medications with valid token', async () => {
      const response = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('medications');
      expect(Array.isArray(response.body.medications)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/medications');

      expect(response.status).toBe(401);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get('/api/medications')
        .query({ patientId: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.medications.every((m: any) => m.patientId === 1)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/medications')
        .query({ status: 'ACTIVE' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/medications/:id', () => {
    it('should get medication by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/medications/${createdMedicationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdMedicationId);
    });

    it('should return 404 for non-existent medication', async () => {
      const response = await request(app)
        .get('/api/medications/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/medications/${createdMedicationId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/medications/:id', () => {
    it('should update medication with valid token', async () => {
      const response = await request(app)
        .put(`/api/medications/${createdMedicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          medicationName: 'Metformin',
          dose: '1000mg',
          route: 'Oral',
          frequency: '2x daily',
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        });

      expect(response.status).toBe(200);
      expect(response.body.dose).toBe('1000mg');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/medications/${createdMedicationId}`)
        .send({
          patientId: 1,
          medicationName: 'Test',
          dose: '500mg',
          startDate: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/medications/:id', () => {
    it('should delete medication with valid token', async () => {
      const response = await request(app)
        .delete(`/api/medications/${createdMedicationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/medications/1');

      expect(response.status).toBe(401);
    });
  });
});
