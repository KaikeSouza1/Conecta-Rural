// Caminho: app/api/produtos/meus/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = payload.usuarioId as string;

    const produtos = await prisma.produto.findMany({
      where: {
        vendedorId: BigInt(usuarioId),
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    const produtosSeguros = produtos.map((produto) => ({
      ...produto,
      id: produto.id.toString(),
      vendedorId: produto.vendedorId.toString(),
      categoriaId: produto.categoriaId?.toString() ?? null,
      preco: produto.preco.toString(),
    }));

    return NextResponse.json(produtosSeguros);
  } catch (error) {
    console.error('Erro ao buscar produtos do vendedor:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 });
  }
}