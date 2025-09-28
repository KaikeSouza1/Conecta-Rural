// Caminho: app/api/pagseguro/notificacoes/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();
    
    // Log para você ver o que o PagSeguro está enviando
    console.log("Notificação recebida do PagSeguro:", JSON.stringify(notificationData, null, 2));

    const orderId = notificationData.id; // Ou o campo correto que identifica o pedido
    const status = notificationData.status; // Ou o campo correto para o status

    // Aqui você adicionaria a lógica para atualizar seu banco de dados
    // Exemplo:
    // if (orderId && status === 'PAID') {
    //   await prisma.pedido.update({
    //     where: { id: parseInt(orderId) }, // ajuste conforme o ID do seu pedido
    //     data: { statusPedido: 'pago' },
    //   });
    // }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro ao processar notificação do PagSeguro:", error);
    return NextResponse.json({ error: 'Erro ao processar notificação.' }, { status: 500 });
  }
}