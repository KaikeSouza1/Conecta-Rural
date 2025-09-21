// Caminho: app/meus-pedidos/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';

// A CORREÇÃO ESTÁ AQUI: 'itens' em vez de 'itensPedido'
interface Pedido {
  id: string;
  criadoEm: string;
  statusPedido: string;
  valorTotal: string;
  itens: {
    quantidade: number;
    precoUnitarioCompra: string;
    produto: {
      nome: string;
      imagemUrl: string | null;
    };
  }[];
}

export default function MeusPedidosPage() {
  const { isAuthLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    const token = Cookies.get('auth_token');
    if (!token) {
        setIsLoading(false);
        return;
    };

    async function fetchPedidos() {
      try {
        const response = await fetch('/api/pedidos/meus', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setPedidos(await response.json());
        }
      } catch (error) {
        console.error("Falha ao buscar pedidos", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPedidos();
  }, [isAuthLoading]);

  if (isAuthLoading || isLoading) {
    return <div className="text-center py-10">Carregando seus pedidos...</div>;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Meus Pedidos</h1>
          <p className="mt-4 text-lg text-gray-500">
            Veja o histórico de todas as suas compras.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <div key={pedido.id} className="p-6 border rounded-lg shadow-md bg-gray-50">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Pedido #{pedido.id}</h2>
                    <p className="text-sm text-gray-500">
                      Realizado em: {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-semibold text-gray-900">
                        Total: R$ {parseFloat(pedido.valorTotal).toFixed(2).replace('.', ',')}
                     </p>
                     <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize">
                        {pedido.statusPedido}
                     </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Itens:</h3>
                  {/* A CORREÇÃO ESTÁ AQUI: 'pedido.itens.map' em vez de 'pedido.itensPedido.map' */}
                  <ul className="space-y-4">
                    {pedido.itens.map((item, index) => (
                       <li key={index} className="flex items-center gap-4">
                         <img 
                           src={item.produto.imagemUrl || '/placeholder.png'} 
                           alt={item.produto.nome}
                           className="w-16 h-16 rounded-md object-cover bg-gray-200"
                         />
                         <div className="flex-grow">
                           <p className="font-medium text-gray-800">{item.produto.nome}</p>
                           <p className="text-sm text-gray-600">
                             {item.quantidade} x R$ {parseFloat(item.precoUnitarioCompra).toFixed(2).replace('.', ',')}
                           </p>
                         </div>
                       </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">Você ainda não fez nenhum pedido.</p>
          )}
        </div>
      </div>
    </div>
  );
}