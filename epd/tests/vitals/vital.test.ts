import request from 'supertest';
import express from 'express';
import vitalRoutes from '../../backend/src/routes/vital.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/vitals', vitalRoutes);

describe('Vital Sign API - Auth0 M2M', () => {
  let authToken: string;
  let createdVitalId: number;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/vitals', () => {
    it('should create vital sign with valid token', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          type: 'BLOOD_PRESSURE',
          value: '120/80 mmHg',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('BLOOD_PRESSURE');
      expect(response.body.value).toBe('120/80 mmHg');
      createdVitalId = response.body.id;
    });

    it('should create heart rate vital', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          type: 'HEART_RATE',
          value: '72 bpm',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('HEART_RATE');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/vitals')
        .send({
          patientId: 1,
          type: 'HEART_RATE',
          value: '72 bpm',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/vitals', () => {
    it('should list vitals with valid token', async () => {
      const response = await request(app)
        .get('/api/vitals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vitals');
      expect(Array.isArray(response.body.vitals)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/vitals');

      expect(response.status).toBe(401);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get('/api/vitals')
        .query({ patientId: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.vitals.every((v: any) => v.patientId === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/vitals')
        .query({ type: 'HEART_RATE' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/vitals/:id', () => {
    it('should get vital by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/vitals/${createdVitalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdVitalId);
    });

    it('should return 404 for non-existent vital', async () => {
      const response = await request(app)
        .get('/api/vitals/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/vitals/${createdVitalId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/vitals/:id', () => {
    it('should update vital with valid token', async () => {
      const response = await request(app)
        .put(`/api/vitals/${createdVitalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          type: 'BLOOD_PRESSURE',
          value: '125/85 mmHg',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.value).toBe('125/85 mmHg');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/vitals/${createdVitalId}`)
        .send({
          patientId: 1,
          type: 'BLOOD_PRESSURE',
          value: '120/80 mmHg',
          measuredAt: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/vitals/:id', () => {
    it('should delete vital with valid token', async () => {
      const response = await request(app)
        .delete(`/api/vitals/${createdVitalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/vitals/1');

      expect(response.status).toBe(401);
    });
  });
});
