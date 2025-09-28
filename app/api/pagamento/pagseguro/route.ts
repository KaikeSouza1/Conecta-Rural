// Caminho: app/api/pagamento/pagseguro/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface CartItem {
  nome: string;
  quantidade: number;
  preco: string;
}

interface RequestBody {
    cartItems: CartItem[];
    // A API ainda espera receber o customer, mas vamos ignorá-lo por enquanto
    customer: any; 
}

export async function POST(request: NextRequest) {
  try {
    const { cartItems }: RequestBody = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'O carrinho está vazio.' }, { status: 400 });
    }
    
    const totalAmount = cartItems.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);

    // DADOS DO CLIENTE FIXOS PARA TESTE
    const customerData = {
        name: 'Cliente Teste Conecta Rural',
        email: 'cliente@teste.com',
        tax_id: '10065676904' // <-- SEU CPF FIXO AQUI
    };

    const orderData = {
      reference_id: `conecta_rural_${Date.now()}`,
      customer: customerData,
      items: cartItems.map(item => ({
        name: item.nome,
        quantity: item.quantidade,
        unit_amount: Math.round(parseFloat(item.preco) * 100),
      })),
      qr_codes: [{
        amount: {
          value: Math.round(totalAmount * 100)
        }
      }],
    };

    const pagbankUrl = 'https://sandbox.api.pagseguro.com/orders';
    
    const response = await fetch(pagbankUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN_SANDBOX!}`,
        'x-api-version': '4.0',
      },
      body: JSON.stringify(orderData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro detalhado do PagSeguro:', responseData);
      const errorMessage = responseData.error_messages?.[0]?.description || 'Erro desconhecido do PagSeguro.';
      throw new Error(errorMessage);
    }
    
    const paymentLink = responseData.links?.find((link: any) => link.rel === 'PAY')?.href;

    if (!paymentLink) {
      throw new Error('Link de pagamento não encontrado na resposta.');
    }
    
    return NextResponse.json({ paymentUrl: paymentLink });

  } catch (error: any) {
    console.error('Erro ao criar checkout PagBank:', error);
    return NextResponse.json({ error: error.message || 'Não foi possível iniciar o pagamento.' }, { status: 500 });
  }
}