import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();
export default prismaMock;
