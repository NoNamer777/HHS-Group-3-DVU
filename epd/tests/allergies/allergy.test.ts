import request from 'supertest';
import express from 'express';
import allergyRoutes from '../../backend/src/routes/allergy.routes';
import { getAuth0Token } from '../helpers/auth0.helper';

const app = express();
app.use(express.json());
app.use('/api/allergies', allergyRoutes);

describe('Allergy API - Auth0 M2M', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getAuth0Token();
  });

  describe('POST /api/allergies', () => {
    it('should create allergy with valid token', async () => {
      const response = await request(app)
        .post('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 1,
          substance: 'Penicillin',
          severity: 'SEVERE',
          reaction: 'Anaphylactic shock'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.substance).toBe('Penicillin');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/allergies')
        .send({
          patientId: 1,
          substance: 'Peanuts',
          severity: 'MILD'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/allergies', () => {
    it('should list allergies with valid token', async () => {
      const response = await request(app)
        .get('/api/allergies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('allergies');
      expect(Array.isArray(response.body.allergies)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/allergies');

      expect(response.status).toBe(401);
    });
  });
});
