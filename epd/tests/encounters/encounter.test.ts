import request from 'supertest';
import express from 'express';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import authRoutes from '../../backend/src/routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);

describe('Encounter API', () => {
  let authToken: string;
  let patientId: number;
  let encounterId: number;

  beforeAll(async () => {
    // Create and login test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Encounter',
        lastName: 'Tester',
        email: `encountertest${Date.now()}@example.com`,
        password: 'password123',
        role: 'DOCTOR'
      });

    authToken = registerResponse.body.accessToken;

    // Create test patient
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1990-01-01',
        sex: 'MALE',
        hospitalNumber: `HN-ENC-${Date.now()}`
      });

    patientId = patientResponse.body.id;
  });

  describe('POST /api/encounters', () => {
    it('should create a new encounter', async () => {
      const response = await request(app)
        .post('/api/encounters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'OUTPATIENT',
          status: 'PLANNED',
          start: new Date().toISOString(),
          reason: 'Regular checkup',
          patientId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('OUTPATIENT');
      expect(response.body.patientId).toBe(patientId);
      encounterId = response.body.id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/encounters')
        .send({
          type: 'OUTPATIENT',
          status: 'PLANNED',
          start: new Date().toISOString(),
          patientId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/encounters', () => {
    it('should return list of encounters', async () => {
      const response = await request(app)
        .get('/api/encounters')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encounters');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(Array.isArray(response.body.encounters)).toBe(true);
    });

    it('should filter by patientId', async () => {
      const response = await request(app)
        .get(`/api/encounters?patientId=${patientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const encounters = response.body.encounters;
      encounters.forEach((enc: any) => {
        expect(enc.patientId).toBe(patientId);
      });
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/encounters?status=PLANNED')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encounters');
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/encounters?type=OUTPATIENT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encounters');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/encounters?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/encounters/:id', () => {
    it('should return encounter by id', async () => {
      const response = await request(app)
        .get(`/api/encounters/${encounterId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(encounterId);
    });

    it('should return 404 for non-existent encounter', async () => {
      const response = await request(app)
        .get('/api/encounters/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Encounter not found');
    });
  });

  describe('PUT /api/encounters/:id', () => {
    it('should update encounter status', async () => {
      const response = await request(app)
        .put(`/api/encounters/${encounterId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('should update encounter with end date', async () => {
      const endDate = new Date();
      const response = await request(app)
        .put(`/api/encounters/${encounterId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
          end: endDate.toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.end).toBeTruthy();
    });
  });

  describe('DELETE /api/encounters/:id', () => {
    it('should delete encounter', async () => {
      const response = await request(app)
        .delete(`/api/encounters/${encounterId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Encounter deleted');
    });
  });
});
