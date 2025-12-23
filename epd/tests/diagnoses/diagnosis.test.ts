import request from 'supertest';
import express from 'express';
import diagnosisRoutes from '../../backend/src/routes/diagnosis.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/diagnoses', diagnosisRoutes);

describe('Diagnosis API - Auth0 M2M', () => {
  let authToken: string;
  let createdDiagnosisId: number;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/diagnoses', () => {
    it('should create diagnosis with valid token', async () => {
      const response = await request(app)
        .post('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          code: 'E11.9',
          description: 'Type 2 diabetes mellitus without complications',
          type: 'PRIMARY',
          onset: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.code).toBe('E11.9');
      expect(response.body.type).toBe('PRIMARY');
      createdDiagnosisId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/diagnoses')
        .send({
          patientId: 1,
          code: 'I10',
          description: 'Essential hypertension',
          type: 'SECONDARY'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/diagnoses', () => {
    it('should list diagnoses with valid token', async () => {
      const response = await request(app)
        .get('/api/diagnoses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('diagnoses');
      expect(Array.isArray(response.body.diagnoses)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/diagnoses');

      expect(response.status).toBe(401);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get('/api/diagnoses')
        .query({ patientId: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.diagnoses.every((d: any) => d.patientId === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/diagnoses')
        .query({ type: 'PRIMARY' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/diagnoses/:id', () => {
    it('should get diagnosis by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/diagnoses/${createdDiagnosisId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdDiagnosisId);
    });

    it('should return 404 for non-existent diagnosis', async () => {
      const response = await request(app)
        .get('/api/diagnoses/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/diagnoses/${createdDiagnosisId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/diagnoses/:id', () => {
    it('should update diagnosis with valid token', async () => {
      const response = await request(app)
        .put(`/api/diagnoses/${createdDiagnosisId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          code: 'E11.9',
          description: 'Type 2 diabetes mellitus - controlled',
          type: 'PRIMARY',
          resolved: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toContain('controlled');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/diagnoses/${createdDiagnosisId}`)
        .send({
          patientId: 1,
          code: 'E11.9',
          description: 'Update',
          type: 'PRIMARY'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/diagnoses/:id', () => {
    it('should delete diagnosis with valid token', async () => {
      const response = await request(app)
        .delete(`/api/diagnoses/${createdDiagnosisId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/diagnoses/1');

      expect(response.status).toBe(401);
    });
  });
});
