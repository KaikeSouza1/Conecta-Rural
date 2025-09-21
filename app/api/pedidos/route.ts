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
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);

    const cartItems: CartItem[] = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'O carrinho está vazio.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca o primeiro endereço de entrega disponível para o usuário
      const endereco = await tx.endereco.findFirst({
        where: { usuarioId: usuarioId },
      });

      // 2. Se nenhum endereço for encontrado, lança um erro que será pego pelo catch
      if (!endereco) {
        throw new Error('Nenhum endereço de entrega cadastrado. Por favor, adicione um endereço em seu perfil.');
      }

      const valorTotalProdutos = cartItems.reduce((acc, item) => {
        return acc + (parseFloat(item.preco) * item.quantidade);
      }, 0);

      // 3. Cria o registro do Pedido principal, usando o ID do endereço encontrado
      const pedido = await tx.pedido.create({
        data: {
          consumidorId: usuarioId,
          enderecoEntregaId: endereco.id, // <-- CÓDIGO ATUALIZADO AQUI
          valorProdutos: valorTotalProdutos,
          statusPedido: 'processando',
        },
      });

      // 4. Cria os Itens do Pedido e atualiza o estoque
      for (const item of cartItems) {
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
          data: {
            estoque: {
              decrement: item.quantidade,
            },
          },
        });
      }

      return pedido;
    });

    return NextResponse.json({ success: true, pedidoId: result.id.toString() }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);

    // Captura o erro específico de falta de endereço que criamos
    if (error.message.includes('Nenhum endereço de entrega cadastrado')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Não foi possível processar o pedido.' }, { status: 500 });
  }
}