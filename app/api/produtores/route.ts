// Caminho: app/api/produtores/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const produtores = await prisma.usuario.findMany({
      where: {
        tipoUsuario: 'vendedor',
      },
      select: {
        id: true,
        nomeNegocio: true,
        descricaoNegocio: true,
        logoUrl: true,
      },
      orderBy: {
        nomeNegocio: 'asc',
      },
    });

    const produtoresSeguros = produtores.map((p) => ({
      ...p,
      id: p.id.toString(),
    }));

    return NextResponse.json(produtoresSeguros);
  } catch (error) {
    console.error('Erro ao buscar produtores:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtores.' }, { status: 500 });
  }
}