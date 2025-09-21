// Caminho: app/api/pedidos/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

interface CartItem {
  id: string;
  quantidade: number;
  preco: string;
  // Precisamos saber o vendedor de cada item
  produto: {
    vendedorId: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);

    const cartItems: CartItem[] = await request.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'O carrinho está vazio.' }, { status: 400 });
    }

    // 1. Organiza os itens do carrinho em um mapa, agrupados por vendedorId
    const pedidosPorVendedor = new Map<string, CartItem[]>();

    // Precisamos buscar os detalhes dos produtos para ter certeza do vendedorId
    const idsProdutos = cartItems.map(item => BigInt(item.id));
    const produtosDoBanco = await prisma.produto.findMany({
        where: { id: { in: idsProdutos } },
        select: { id: true, vendedorId: true }
    });

    for (const item of cartItems) {
        const produtoInfo = produtosDoBanco.find(p => p.id.toString() === item.id);
        if (produtoInfo) {
            const vendedorId = produtoInfo.vendedorId.toString();
            if (!pedidosPorVendedor.has(vendedorId)) {
                pedidosPorVendedor.set(vendedorId, []);
            }
            pedidosPorVendedor.get(vendedorId)!.push(item);
        }
    }
    
    // 2. Inicia uma transação para criar todos os pedidos de uma vez
    const pedidosCriados = await prisma.$transaction(async (tx) => {
      const endereco = await tx.endereco.findFirst({ where: { usuarioId } });
      if (!endereco) throw new Error('Nenhum endereço de entrega cadastrado.');

      const arrayDePedidos = [];

      // 3. Itera sobre cada grupo de vendedor para criar um pedido separado
      for (const [vendedorId, itensDoVendedor] of pedidosPorVendedor.entries()) {
        const valorTotalProdutos = itensDoVendedor.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);
        
        const pedido = await tx.pedido.create({
          data: {
            consumidorId: usuarioId,
            enderecoEntregaId: endereco.id,
            valorProdutos: valorTotalProdutos,
            valorTotal: valorTotalProdutos, // Simplificado, pode incluir frete no futuro
            statusPedido: 'processando',
          },
        });

        for (const item of itensDoVendedor) {
          await tx.itemPedido.create({
            data: {
              pedidoId: pedido.id,
              produtoId: BigInt(item.id),
              quantidade: item.quantidade,
              precoUnitarioCompra: parseFloat(item.preco),
            },
          });
          await tx.produto.update({
            where: { id: BigInt(item.id) },
            data: { estoque: { decrement: item.quantidade } },
          });
        }
        arrayDePedidos.push(pedido);
      }
      return arrayDePedidos;
    });

    return NextResponse.json({ success: true, numPedidosCriados: pedidosCriados.length });

  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    if (error.message.includes('Nenhum endereço de entrega cadastrado')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Não foi possível processar o pedido.' }, { status: 500 });
  }
}