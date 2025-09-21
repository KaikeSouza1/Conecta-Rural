// Caminho: app/carrinho/page.tsx
'use client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function CarrinhoPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  async function handleCheckout() {
    if (!isAuthenticated) {
      alert('Você precisa fazer login para finalizar a compra.');
      router.push('/login');
      return;
    }

    const token = Cookies.get('auth_token');

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartItems),
      });

      if (response.ok) {
        alert('Pedido realizado com sucesso!');
        clearCart();
        router.push('/'); // Ou para uma página de "meus pedidos" no futuro
      } else {
        const data = await response.json();
        alert(`Erro ao finalizar o pedido: ${data.error}`);
      }
    } catch (error) {
      alert('Erro de rede. Não foi possível finalizar o pedido.');
    }
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Seu Carrinho</h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section className="lg:col-span-7">
            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cartItems.length > 0 ? (
                cartItems.map((produto) => (
                  <li key={produto.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <img src={produto.imagemUrl || '/placeholder.png'} alt={`Imagem de ${produto.nome}`} className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div>
                        <h3 className="font-medium text-gray-700">{produto.nome}</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="mt-4 flex items-center">
                        <label htmlFor={`quantity-${produto.id}`} className="mr-2">Qtd:</label>
                        <input id={`quantity-${produto.id}`} type="number" min="1" value={produto.quantidade} onChange={(e) => updateQuantity(produto.id, parseInt(e.target.value, 10))} className="w-20 rounded-md border border-gray-300 py-1.5 text-center"/>
                        <button type="button" onClick={() => removeFromCart(produto.id)} className="ml-4 text-sm font-medium text-red-600 hover:text-red-500">Remover</button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="py-8 text-center text-gray-500">Seu carrinho está vazio.</p>
              )}
            </ul>
          </section>
          <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Resumo do Pedido</h2>
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Total do Pedido</dt>
                <dd className="text-base font-medium text-gray-900">R$ {cartTotal.toFixed(2).replace('.', ',')}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <button onClick={handleCheckout} className="w-full rounded-md border border-transparent bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700">
                Finalizar Compra
              </button>
            </div>
            <div className="mt-6 text-center text-sm"><p>ou{' '}<Link href="/loja" className="font-medium text-emerald-600 hover:text-emerald-500">Continue comprando<span> &rarr;</span></Link></p></div>
          </section>
        </div>
      </div>
    </div>
  );
}