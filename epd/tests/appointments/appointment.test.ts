import request from 'supertest';
import express from 'express';
import appointmentRoutes from '../../backend/src/routes/appointment.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment API - Auth0 M2M', () => {
  let authToken: string;
  let createdAppointmentId: number;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/appointments', () => {
    it('should create appointment with valid token', async () => {
      const now = new Date();
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min later

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          clinicianId: 1,
          start: start.toISOString(),
          end: end.toISOString(),
          location: 'Polikliniek 2A',
          reason: 'Follow-up diabetes consultation',
          status: 'SCHEDULED'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('SCHEDULED');
      createdAppointmentId = response.body.id;
    });

    it('should create follow-up appointment', async () => {
      const now = new Date();
      const start = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 15 * 60 * 1000);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          clinicianId: 1,
          start: start.toISOString(),
          end: end.toISOString(),
          reason: 'Follow-up consultation'
        });

      expect(response.status).toBe(201);
    });

    it('should fail without authentication', async () => {
      const now = new Date();
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const response = await request(app)
        .post('/api/appointments')
        .send({
          patientId: 1,
          start: start.toISOString(),
          end: end.toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/appointments', () => {
    it('should list appointments with valid token', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('appointments');
      expect(Array.isArray(response.body.appointments)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/appointments');

      expect(response.status).toBe(401);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .query({ patientId: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.appointments.every((a: any) => a.patientId === 1)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .query({ status: 'SCHEDULED' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should get appointment by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdAppointmentId);
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/appointments/${createdAppointmentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment with valid token', async () => {
      const now = new Date();
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const response = await request(app)
        .put(`/api/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
          location: 'Polikliniek 3B',
          reason: 'Updated location and completed'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.location).toBe('Polikliniek 3B');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/appointments/${createdAppointmentId}`)
        .send({
          status: 'COMPLETED'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment with valid token', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete('/api/appointments/1');

      expect(response.status).toBe(401);
    });
  });
});
