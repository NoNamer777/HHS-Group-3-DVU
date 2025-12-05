import { prisma } from '../lib/prisma';
import { Prisma, EncounterStatus, EncounterType } from '@prisma/client';

export const encounterService = {
  async findAll(filters?: { patientId?: number; status?: EncounterStatus; type?: EncounterType; skip?: number; take?: number }) {
    const where: Prisma.EncounterWhereInput = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }

    const [encounters, total] = await Promise.all([
      prisma.encounter.findMany({
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
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { start: 'desc' }
      }),
      prisma.encounter.count({ where })
    ]);

    return { encounters, total };
  },

  async findById(id: number) {
    return prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        medicalRecords: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        diagnoses: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        medicationOrders: {
          include: {
            prescriber: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });
  },

  async create(data: Prisma.EncounterCreateInput) {
    return prisma.encounter.create({
      data,
      include: {
        patient: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  },

  async update(id: number, data: Prisma.EncounterUpdateInput) {
    return prisma.encounter.update({
      where: { id },
      data,
      include: {
        patient: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  },

  async delete(id: number) {
    return prisma.encounter.delete({ where: { id } });
  }
};
