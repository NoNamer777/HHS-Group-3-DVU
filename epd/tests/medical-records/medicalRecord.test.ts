import request from 'supertest';
import express from 'express';
import medicalRecordRoutes from '../../backend/src/routes/medicalRecord.routes';
import encounterRoutes from '../../backend/src/routes/encounter.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import authRoutes from '../../backend/src/routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

describe('Medical Record API', () => {
  let authToken: string;
  let patientId: number;
  let encounterId: number;
  let recordId: number;

  beforeAll(async () => {
    // Create and login test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Record',
        lastName: 'Tester',
        email: `recordtest${Date.now()}@example.com`,
        password: 'password123',
        role: 'DOCTOR'
      });

    authToken = registerResponse.body.accessToken;

    // Create test patient
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Medical',
        lastName: 'Record Patient',
        dateOfBirth: '1990-01-01',
        sex: 'FEMALE',
        hospitalNumber: `HN-MR-${Date.now()}`
      });

    patientId = patientResponse.body.id;

    // Create test encounter
    const encounterResponse = await request(app)
      .post('/api/encounters')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'INPATIENT',
        status: 'IN_PROGRESS',
        start: new Date().toISOString(),
        patientId
      });

    encounterId = encounterResponse.body.id;

    // Create shared test record for GET/PUT/DELETE tests
    const recordResponse = await request(app)
      .post('/api/medical-records')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'NOTE',
        title: 'Shared Test Record',
        content: 'This is a shared test medical record.',
        patientId,
        encounterId
      });

    recordId = recordResponse.body.id;
  });

  describe('POST /api/medical-records', () => {
    it('should create a new medical record', async () => {
      const response = await request(app)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'NOTE',
          title: 'Initial Assessment',
          content: 'Patient admitted with chest pain. Vitals stable.',
          patientId,
          encounterId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Initial Assessment');
      expect(response.body.type).toBe('NOTE');
    });

    it('should create consultation record', async () => {
      const response = await request(app)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'CONSULTATION',
          title: 'Cardiology Consultation',
          content: 'Consulted with cardiology department. ECG shows normal sinus rhythm.',
          patientId,
          encounterId
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('CONSULTATION');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/medical-records')
        .send({
          type: 'NOTE',
          title: 'Test',
          content: 'Test content',
          patientId,
          encounterId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/medical-records', () => {
    it('should return list of medical records', async () => {
      const response = await request(app)
        .get('/api/medical-records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(Array.isArray(response.body.records)).toBe(true);
    });

    it('should filter by patientId', async () => {
      const response = await request(app)
        .get(`/api/medical-records?patientId=${patientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const records = response.body.records;
      records.forEach((rec: any) => {
        expect(rec.patientId).toBe(patientId);
      });
    });

    it('should filter by encounterId', async () => {
      const response = await request(app)
        .get(`/api/medical-records?encounterId=${encounterId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const records = response.body.records;
      records.forEach((rec: any) => {
        expect(rec.encounterId).toBe(encounterId);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/medical-records?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/medical-records/:id', () => {
    it('should return medical record by id', async () => {
      const response = await request(app)
        .get(`/api/medical-records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(recordId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
    });

    it('should return 404 for non-existent record', async () => {
      const response = await request(app)
        .get('/api/medical-records/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Record not found');
    });
  });

  describe('PUT /api/medical-records/:id', () => {
    it('should update medical record', async () => {
      const response = await request(app)
        .put(`/api/medical-records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Assessment',
          content: 'Updated content with additional observations.'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Assessment');
      expect(response.body.content).toContain('additional observations');
    });
  });

  describe('DELETE /api/medical-records/:id', () => {
    let deleteRecordId: number;

    beforeAll(async () => {
      // Create a fresh record specifically for deletion test
      const response = await request(app)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'NOTE',
          title: 'Delete Me',
          content: 'This record will be deleted.',
          patientId,
          encounterId
        });
      
      deleteRecordId = response.body.id;
    });

    it('should delete medical record', async () => {
      const response = await request(app)
        .delete(`/api/medical-records/${deleteRecordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Record deleted');
    });
  });
});
