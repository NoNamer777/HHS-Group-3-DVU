import request from 'supertest';
import express from 'express';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/encounters', encounterRoutes);

describe('Encounter API - Auth0 M2M', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/encounters', () => {
    it('should create encounter with valid token', async () => {
      const response = await request(app)
        .post('/api/encounters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          doctorId: 1,
          type: 'OUTPATIENT',
          status: 'PLANNED',
          startTime: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('OUTPATIENT');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/encounters')
        .send({
          patientId: 1,
          doctorId: 1,
          type: 'EMERGENCY',
          status: 'PLANNED'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/encounters', () => {
    it('should list encounters with valid token', async () => {
      const response = await request(app)
        .get('/api/encounters')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encounters');
      expect(Array.isArray(response.body.encounters)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/encounters');

      expect(response.status).toBe(401);
    });
  });
});
