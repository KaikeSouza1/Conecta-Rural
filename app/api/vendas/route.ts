// Caminho: app/api/vendas/route.ts

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
    const tipoUsuario = payload.tipoUsuario as string;

    if (tipoUsuario !== 'vendedor') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const pedidos = await prisma.pedido.findMany({
        where: {
            itens: {
                some: {
                    produto: {
                        vendedorId: usuarioId,
                    }
                }
            }
        },
        include: {
            itens: {
                include: {
                    produto: {
                        select: { nome: true }
                    }
                }
            },
            consumidor: {
                select: { nomeCompleto: true }
            }
        },
        orderBy: {
            criadoEm: 'desc'
        }
    });

    const safePedidos = pedidos.map(pedido => ({
        ...pedido,
        id: pedido.id.toString(),
        consumidorId: pedido.consumidorId.toString(),
        enderecoEntregaId: pedido.enderecoEntregaId.toString(),
        valorTotal: pedido.valorTotal?.toString() ?? '0',
        itens: pedido.itens.map(item => ({
            ...item,
            // A linha que tentava acessar 'item.id' foi removida מכאן
            pedidoId: item.pedidoId.toString(),
            produtoId: item.produtoId.toString(),
            precoUnitarioCompra: item.precoUnitarioCompra.toString(),
        }))
    }));

    return NextResponse.json(safePedidos);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de vendas.' }, { status: 500 });
  }
}