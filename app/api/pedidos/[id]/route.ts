// Caminho: app/api/pedidos/[id]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// As funções GET, PUT, e DELETE que já fizemos antes devem estar aqui.
// O erro está na função PATCH, então vamos focar nela.

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const token = request.headers.get('authorization')?.split(' ')[1];
      if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      
      const { payload } = await jwtVerify(token, secret);
      const usuarioId = BigInt(payload.usuarioId as string);
      const tipoUsuario = payload.tipoUsuario as string;
      const idDoPedido = BigInt(params.id);

      if (tipoUsuario !== 'vendedor') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
      }

      const pedido = await prisma.pedido.findFirst({
        where: {
            id: idDoPedido,
            itens: {
                some: {
                    produto: {
                        vendedorId: usuarioId
                    }
                }
            }
        }
      });
      
      if (!pedido) {
        return NextResponse.json({ error: 'Pedido não encontrado ou você não tem permissão para alterá-lo.' }, { status: 404 });
      }
  
      const { status } = await request.json();
      if (!status) {
        return NextResponse.json({ error: 'Novo status não fornecido.'}, { status: 400 });
      }

      const pedidoAtualizado = await prisma.pedido.update({
        where: { id: idDoPedido },
        data: { statusPedido: status },
      });
      
      // A CORREÇÃO ESTÁ AQUI: Convertendo os campos para string antes de retornar
      const pedidoSeguro = { 
        ...pedidoAtualizado, 
        id: pedidoAtualizado.id.toString(),
        consumidorId: pedidoAtualizado.consumidorId.toString(),
        enderecoEntregaId: pedidoAtualizado.enderecoEntregaId.toString(),
        valorProdutos: pedidoAtualizado.valorProdutos.toString(),
        valorEntrega: pedidoAtualizado.valorEntrega?.toString(),
        valorComissao: pedidoAtualizado.valorComissao?.toString(),
        valorTotal: pedidoAtualizado.valorTotal?.toString(),
      };
      
      return NextResponse.json(pedidoSeguro);

    } catch (error) {
      console.error("Erro ao alterar status do pedido:", error);
      return NextResponse.json({ error: 'Erro ao alterar status do pedido.' }, { status: 500 });
    }
}