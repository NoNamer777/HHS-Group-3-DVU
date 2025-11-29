import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { prisma } from './lib/prisma';

// Routes
import userRoutes from './routes/user.routes';
import patientRoutes from './routes/patient.routes';
import encounterRoutes from './routes/encounter.routes';
import medicalRecordRoutes from './routes/medicalRecord.routes';
import diagnosisRoutes from './routes/diagnosis.routes';
import medicationRoutes from './routes/medication.routes';
import allergyRoutes from './routes/allergy.routes';
import vitalRoutes from './routes/vital.routes';
import labResultRoutes from './routes/labResult.routes';
import appointmentRoutes from './routes/appointment.routes';
import insuranceRoutes from './routes/insurance.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'EPD API Documentation'
}));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/allergies', allergyRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/lab-results', labResultRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/insurance', insuranceRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🏥 EPD Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📖 API Documentation: http://localhost:${port}/api-docs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
