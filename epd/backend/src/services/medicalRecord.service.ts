import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const medicalRecordService = {
  async findAll(filters?: { patientId?: number; encounterId?: number; skip?: number; take?: number }) {
    const where: Prisma.MedicalRecordWhereInput = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.encounterId) {
      where.encounterId = filters.encounterId;
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        ...(filters?.skip !== undefined && { skip: filters.skip }),
        ...(filters?.take !== undefined && { take: filters.take }),
        include: {
          patient: {
            select: {
              id: true,
              hospitalNumber: true,
              firstName: true,
              lastName: true,
            }
          },
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
          encounter: {
            select: {
              id: true,
              type: true,
              start: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.medicalRecord.count({ where })
    ]);

    return { records, total };
  },

  async findById(id: number) {
    return prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        },
        encounter: true
      }
    });
  },

  async create(data: Prisma.MedicalRecordCreateInput) {
    return prisma.medicalRecord.create({
      data,
      include: {
        patient: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.MedicalRecordUpdateInput) {
    return prisma.medicalRecord.update({
      where: { id },
      data,
      include: {
        patient: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    });
  },

  async delete(id: number) {
    return prisma.medicalRecord.delete({ where: { id } });
  }
};
