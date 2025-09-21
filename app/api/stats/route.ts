// Caminho: app/api/stats/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Conta quantos usuários são do tipo 'vendedor'
    const totalProdutores = await prisma.usuario.count({
      where: { tipoUsuario: 'vendedor' },
    });

    // Conta quantos produtos estão cadastrados
    const totalProdutos = await prisma.produto.count();
    
    // A média de avaliação será fixa por enquanto
    const mediaAvaliacao = 4.8;

    return NextResponse.json({
      produtores: totalProdutores,
      produtos: totalProdutos,
      avaliacao: mediaAvaliacao,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas.' }, { status: 500 });
  }
}