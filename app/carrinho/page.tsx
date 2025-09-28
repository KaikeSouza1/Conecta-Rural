'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CarrinhoPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Você precisa fazer login para finalizar a compra.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pedidoResponse = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cartItems),
      });

      const pedidoData = await pedidoResponse.json();
      if (!pedidoResponse.ok) {
        throw new Error(pedidoData.error || 'Falha ao criar o pedido interno.');
      }
      
      const { pedidosCriados } = pedidoData;
      // Pega o ID do primeiro pedido criado (agora 'pedidosCriados' existe)
      const pedidoId = pedidosCriados[0].id;

      const pagseguroResponse = await fetch('/api/pagseguro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartItems),
      });

      const pagseguroData = await pagseguroResponse.json();

      if (!pagseguroResponse.ok) {
          throw new Error(pagseguroData.error || 'Falha ao comunicar com o PagSeguro.');
      }

      const qrCode = pagseguroData.qr_codes?.[0];
      if (qrCode) {
        const qrCodeText = encodeURIComponent(qrCode.text);
        const qrCodePngLink = encodeURIComponent(qrCode.links.find((l: any) => l.rel === 'QRCODE.PNG').href);
        
        clearCart();
        router.push(`/pagamento/${pedidoId}?qrCodeText=${qrCodeText}&qrCodeLink=${qrCodePngLink}`);
      } else {
        throw new Error('Não foi possível obter o QR Code para pagamento.');
      }

    } catch (err: any) {
      console.error('Erro no checkout:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // O resto do seu componente JSX continua igual...
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Seu Carrinho</h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section className="lg:col-span-7">
            <h2 className="sr-only">Itens no seu carrinho de compras</h2>
            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cartItems.length > 0 ? (
                cartItems.map((produto) => (
                  <li key={produto.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <img src={produto.imagemUrl || '/placeholder.png'} alt={`Imagem de ${produto.nome}`} className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <h3 className="font-medium text-gray-700">{produto.nome}</h3>
                          <p className="mt-1 text-lg font-medium text-gray-900">R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <label htmlFor={`quantity-${produto.id}`} className="sr-only">Quantidade</label>
                          <input id={`quantity-${produto.id}`} type="number" min="1" value={produto.quantidade} onChange={(e) => updateQuantity(produto.id, parseInt(e.target.value, 10))} className="w-20 rounded-md border border-gray-300 py-1.5 text-center"/>
                          <div className="absolute right-0 top-0">
                            <button type="button" onClick={() => removeFromCart(produto.id)} className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                              <span className="sr-only">Remover</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="py-8 text-center text-gray-500">Seu carrinho está vazio.</p>
              )}
            </ul>
          </section>
          <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg-col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Resumo do Pedido</h2>
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Total do Pedido</dt>
                <dd className="text-base font-medium text-gray-900">R$ {cartTotal.toFixed(2).replace('.', ',')}</dd>
              </div>
            </dl>
            <div className="mt-6">
               <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className={`w-full rounded-md border border-transparent bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processando...' : 'Finalizar Compra'}
                </button>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>
            <div className="mt-6 text-center text-sm"><p>ou{' '}<Link href="/loja" className="font-medium text-emerald-600 hover:text-emerald-500">Continue comprando<span> &rarr;</span></Link></p></div>
          </section>
        </div>
      </div>
    </div>
  );
}