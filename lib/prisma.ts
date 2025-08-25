// Caminho do arquivo: lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Declara uma variável global para o prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Cria a conexão, reutilizando a conexão existente em desenvolvimento
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;