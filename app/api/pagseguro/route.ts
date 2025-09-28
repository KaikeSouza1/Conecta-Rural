// Caminho: app/api/pagseguro/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface CartItem {
  id: string;
  nome: string;
  quantidade: number;
  preco: string;
}

export async function POST(request: NextRequest) {
  try {
    const cartItems: CartItem[] = await request.json();
    
    // --- MUDANÇA 1: Usando o token de PRODUÇÃO ---
    const token = process.env.PAGSEGURO_PRODUCTION_TOKEN;

    if (!token) {
      console.error("Token de PRODUÇÃO do PagSeguro não foi encontrado no .env.local");
      return NextResponse.json({ error: 'Credenciais de pagamento não configuradas.' }, { status: 500 });
    }

    const items = cartItems.map(item => ({
      name: item.nome,
      quantity: item.quantidade,
      unit_amount: Math.round(parseFloat(item.preco) * 100), // Preço em centavos
    }));

    const totalAmount = items.reduce((acc, item) => acc + (item.unit_amount * item.quantity), 0);

    const body = {
      customer: {
        name: 'Cliente Conecta Rural', // Em produção, você pode querer pegar o nome do usuário logado
        email: 'cliente@email.com',    // e o email do usuário logado
        tax_id: '12345678909',       // e o CPF do usuário logado
      },
      items: items,
      qr_codes: [{
        amount: {
          value: totalAmount,
        },
      }],
      notification_urls: ["https://conectarural.shop/api/pagseguro/notificacoes"],
    };
    
    // --- MUDANÇA 2: Usando a URL de PRODUÇÃO ---
    const pagseguroResponse = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await pagseguroResponse.json();

    console.log("Resposta da API de Produção do PagSeguro:", JSON.stringify(data, null, 2));

    if (!pagseguroResponse.ok) {
      return NextResponse.json({ 
        error: 'Falha ao criar pedido no PagSeguro.', 
        details: data 
      }, { status: pagseguroResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro grave na API do PagSeguro:', error);
    return NextResponse.json({ error: 'Não foi possível se comunicar com a API do PagSeguro.' }, { status: 500 });
  }
}