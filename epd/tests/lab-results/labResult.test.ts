import request from 'supertest';
import express from 'express';
import labResultRoutes from '../../backend/src/routes/labResult.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/lab-results', labResultRoutes);

describe('Lab Result API - Auth0 M2M', () => {
  let authToken: string;
  let createdLabResultId: number;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/lab-results', () => {
    it('should create lab result with valid token', async () => {
      const response = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          testName: 'HbA1c',
          value: '7.2',
          unit: '%',
          referenceRange: '4.0-6.0',
          status: 'FINAL',
          takenAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.testName).toBe('HbA1c');
      expect(response.body.status).toBe('FINAL');
      createdLabResultId = response.body.id;
    });

    it('should create normal lab result', async () => {
      const response = await request(app)
        .post('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          testName: 'Total Cholesterol',
          value: '4.5',
          unit: 'mmol/L',
          referenceRange: '<5.0',
          status: 'PRELIMINARY',
          takenAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('PRELIMINARY');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/lab-results')
        .send({
          patientId: 1,
          testName: 'Glucose',
          value: '5.5',
          status: 'NORMAL',
          performedAt: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/lab-results', () => {
    it('should list lab results with valid token', async () => {
      const response = await request(app)
        .get('/api/lab-results')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('labResults');
      expect(Array.isArray(response.body.labResults)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/lab-results');

      expect(response.status).toBe(401);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get('/api/lab-results')
        .query({ patientId: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.labResults.every((r: any) => r.patientId === 1)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/lab-results')
        .query({ status: 'FINAL' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/lab-results/:id', () => {
    it('should get lab result by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/lab-results/${createdLabResultId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdLabResultId);
    });

    it('should return 404 for non-existent lab result', async () => {
      const response = await request(app)
        .get('/api/lab-results/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/lab-results/${createdLabResultId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/lab-results/:id', () => {
    it('should update lab result with valid token', async () => {
      const response = await request(app)
        .put(`/api/lab-results/${createdLabResultId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          testName: 'HbA1c',
          value: '6.8',
          unit: '%',
          referenceRange: '4.0-6.0',
          status: 'FINAL'
        });

      expect(response.status).toBe(200);
      expect(response.body.value).toBe('6.8');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/lab-results/${createdLabResultId}`)
        .send({
          patientId: 1,
          testName: 'Test',
          value: '5.0',
          status: 'NORMAL',
          performedAt: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/lab-results/:id', () => {
    it('should delete lab result with valid token', async () => {
      const response = await request(app)
        .delete(`/api/lab-results/${createdLabResultId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/lab-results/1');

      expect(response.status).toBe(401);
    });
  });
});
