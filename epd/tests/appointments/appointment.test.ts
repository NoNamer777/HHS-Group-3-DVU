import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';
import patientRoutes from '../../backend/src/routes/patient.routes';
import appointmentRoutes from '../../backend/src/routes/appointment.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

describe('Appointment API', () => {
  let authToken: string;
  let testPatient: any;

  beforeAll(async () => {
    // Create test user and authenticate
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `appointment-test-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Appointment',
        lastName: 'Tester',
        role: 'DOCTOR'
      });

    expect(userResponse.status).toBe(201);
    authToken = userResponse.body.accessToken;

    // Create test patient
    const patientResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Appointment',
        lastName: 'Patient',
        dateOfBirth: '1988-04-15T00:00:00.000Z',
        sex: 'FEMALE',
        email: `appointment-patient-${Date.now()}@example.com`,
        phone: '+31698765432',
        addressLine1: 'Appointment Avenue 30',
        city: 'Groningen',
        postalCode: '9700AA',
        hospitalNumber: `APT-${Date.now()}`
      });

    testPatient = patientResponse.body;
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min later

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          location: 'Room 101',
          status: 'SCHEDULED',
          reason: 'Annual checkup'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reason).toBe('Annual checkup');
      expect(response.body.location).toBe('Room 101');
    });

    it('should fail without authentication', async () => {
      const start = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 45 * 60 * 1000);

      const response = await request(app)
        .post('/api/appointments')
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status: 'SCHEDULED',
          reason: 'Follow-up visit'
        });

      expect(response.status).toBe(401);
    });

    it('should create appointment with location', async () => {
      const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          location: 'Surgery Room 3',
          status: 'SCHEDULED',
          reason: 'Minor procedure'
        });

      expect(response.status).toBe(201);
      expect(response.body.location).toBe('Surgery Room 3');
    });
  });

  describe('GET /api/appointments', () => {
    it('should list all appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('appointments');
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });

    it('should filter appointments by patientId', async () => {
      const response = await request(app)
        .get(`/api/appointments?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.appointments.every((a: any) => a.patientId === testPatient.id)).toBe(true);
    });

    it('should filter appointments by status', async () => {
      const response = await request(app)
        .get('/api/appointments?status=SCHEDULED')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.appointments.every((a: any) => a.status === 'SCHEDULED')).toBe(true);
    });

    it('should filter appointments by location', async () => {
      const response = await request(app)
        .get(`/api/appointments?location=Room`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });

    it('should filter appointments by date range', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(`/api/appointments?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/appointments?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should get appointment by id', async () => {
      const start = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          location: 'Exam Room 2',
          status: 'SCHEDULED',
          reason: 'Physical examination'
        });

      const response = await request(app)
        .get(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.reason).toBe('Physical examination');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment status', async () => {
      const start = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 45 * 60 * 1000);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status: 'SCHEDULED',
          reason: 'Routine visit'
        });

      const response = await request(app)
        .put(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
          reason: 'Patient confirmed attendance'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
    });

    it('should reschedule appointment', async () => {
      const start = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const newStart = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 30 * 60 * 1000);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status: 'SCHEDULED',
          reason: 'Follow-up consultation'
        });

      const response = await request(app)
        .put(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          start: newStart.toISOString(),
          end: newEnd.toISOString()
        });

      expect(response.status).toBe(200);
      expect(new Date(response.body.start).getTime()).toBe(newStart.getTime());
    });

    it('should cancel appointment', async () => {
      const start = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status: 'SCHEDULED',
          reason: 'Scheduled procedure'
        });

      const response = await request(app)
        .put(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'CANCELLED'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CANCELLED');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment', async () => {
      const start = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status: 'SCHEDULED',
          reason: 'Test appointment'
        });

      const deleteResponse = await request(app)
        .delete(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toContain('deleted');

      const getResponse = await request(app)
        .get(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
