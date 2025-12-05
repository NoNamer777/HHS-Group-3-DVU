import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const appointmentService = {
  async findAll(options: {
    patientId?: number;
    clinicianId?: number;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.AppointmentWhereInput = {};
    
    if (options.patientId) where.patientId = options.patientId;
    if (options.clinicianId) where.clinicianId = options.clinicianId;
    if (options.status) where.status = options.status as any;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        ...(options.skip && { skip: options.skip }),
        ...(options.take && { take: options.take }),
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          },
          clinician: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { start: 'asc' }
      }),
      prisma.appointment.count({ where })
    ]);

    return { appointments, total };
  },

  async findById(id: number) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        clinician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async create(data: Prisma.AppointmentCreateInput) {
    return prisma.appointment.create({
      data,
      include: {
        patient: true,
        clinician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.AppointmentUpdateInput) {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: true,
        clinician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async delete(id: number) {
    return prisma.appointment.delete({ where: { id } });
  }
};
