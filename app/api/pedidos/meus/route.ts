// Caminho: app/api/pedidos/meus/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);

    const pedidos = await prisma.pedido.findMany({
      where: { consumidorId: usuarioId },
      include: {
        // CORREÇÃO AQUI: O nome da relação é 'itens'
        itens: {
          include: {
            produto: {
              select: {
                nome: true,
                imagemUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    const safePedidos = pedidos.map(pedido => ({
        ...pedido,
        id: pedido.id.toString(),
        consumidorId: pedido.consumidorId.toString(),
        enderecoEntregaId: pedido.enderecoEntregaId.toString(),
        valorProdutos: pedido.valorProdutos.toString(),
        valorEntrega: pedido.valorEntrega?.toString(),
        valorComissao: pedido.valorComissao?.toString(),
        valorTotal: pedido.valorTotal?.toString(),
        // CORREÇÃO AQUI: Usando 'itens' para o map
        itens: pedido.itens.map(item => ({
            ...item,
            pedidoId: item.pedidoId.toString(),
            produtoId: item.produtoId.toString(),
            precoUnitarioCompra: item.precoUnitarioCompra.toString(),
        }))
    }));

    return NextResponse.json(safePedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de pedidos.' }, { status: 500 });
  }
}