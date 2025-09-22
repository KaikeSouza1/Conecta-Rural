// Caminho: app/api/stats/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Conta quantos usuários são do tipo 'vendedor'
    const totalProdutores = await prisma.usuario.count({
      where: { tipoUsuario: 'vendedor' },
    });

    // Conta quantos produtos estão cadastrados e ativos
    const totalProdutos = await prisma.produto.count({
      where: { ativo: true },
    });

    return NextResponse.json({
      produtores: totalProdutores,
      produtos: totalProdutos,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas.' }, { status: 500 });
  }
}