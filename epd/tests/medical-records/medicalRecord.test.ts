import request from 'supertest';
import express from 'express';
import medicalRecordRoutes from '../../backend/src/routes/medicalRecord.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/medical-records', medicalRecordRoutes);

describe('Medical Record API - Auth0 M2M', () => {
  let authToken: string;
  let createdRecordId: number;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/medical-records', () => {
    it('should create medical record with valid token', async () => {
      const response = await request(app)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          type: 'NOTE',
          title: 'Diabetes follow-up',
          content: 'Patient shows improvement in blood glucose levels. Continue current medication regimen.'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Diabetes follow-up');
      expect(response.body.type).toBe('NOTE');
      createdRecordId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/medical-records')
        .send({
          patientId: 1,
          type: 'CONSULTATION',
          content: 'Test content'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/medical-records', () => {
    it('should list medical records with valid token', async () => {
      const response = await request(app)
        .get('/api/medical-records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
      expect(Array.isArray(response.body.records)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/medical-records');

      expect(response.status).toBe(401);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get('/api/medical-records')
        .query({ patientId: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.records.every((r: any) => r.patientId === 1)).toBe(true);
    });
  });

  describe('GET /api/medical-records/:id', () => {
    it('should get medical record by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/medical-records/${createdRecordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdRecordId);
    });

    it('should return 404 for non-existent record', async () => {
      const response = await request(app)
        .get('/api/medical-records/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/medical-records/${createdRecordId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/medical-records/:id', () => {
    it('should update medical record with valid token', async () => {
      const response = await request(app)
        .put(`/api/medical-records/${createdRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          type: 'NOTE',
          title: 'Updated follow-up',
          content: 'Updated content for medical record.'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated follow-up');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/medical-records/${createdRecordId}`)
        .send({
          patientId: 1,
          type: 'PROGRESS_NOTE',
          content: 'Update attempt'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/medical-records/:id', () => {
    it('should delete medical record with valid token', async () => {
      const response = await request(app)
        .delete(`/api/medical-records/${createdRecordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/medical-records/1');

      expect(response.status).toBe(401);
    });
  });
});
