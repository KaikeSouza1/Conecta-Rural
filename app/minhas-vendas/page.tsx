// Caminho: app/minhas-vendas/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface PedidoVenda {
  id: string;
  criadoEm: string;
  statusPedido: string;
  valorTotal: string;
  consumidor: {
    nomeCompleto: string;
  };
  itens: {
    quantidade: number;
    precoUnitarioCompra: string;
    produto: {
      nome: string;
    };
  }[];
}

export default function MinhasVendasPage() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const [vendas, setVendas] = useState<PedidoVenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendas = useCallback(async () => {
    const token = Cookies.get('auth_token');
    if (!token) return;
    try {
      const response = await fetch('/api/vendas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setVendas(await response.json());
      } else {
        setError('Não foi possível carregar suas vendas.');
      }
    } catch (err) {
      setError('Erro de rede ao carregar as vendas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.tipoUsuario !== 'vendedor')) {
      router.push('/');
    } else if (user) {
      fetchVendas();
    }
  }, [user, isAuthLoading, router, fetchVendas]);

  async function handleStatusChange(pedidoId: string, novoStatus: string) {
    const token = Cookies.get('auth_token');
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        // Atualiza a lista de vendas para refletir a mudança
        fetchVendas();
      } else {
        alert('Falha ao atualizar o status do pedido.');
      }
    } catch (err) {
      alert('Erro de rede ao atualizar o status.');
    }
  }

  if (isAuthLoading || isLoading) {
    return <div className="text-center py-10">Carregando suas vendas...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="pb-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Minhas Vendas</h1>
        <p className="mt-4 text-lg text-gray-500">Gerencie os pedidos recebidos para seus produtos.</p>
      </div>

      <div className="mt-8 space-y-8">
        {vendas.length > 0 ? (
          vendas.map((pedido) => (
            <div key={pedido.id} className="p-6 border rounded-lg shadow-md bg-gray-50">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Pedido #{pedido.id}</h2>
                  <p className="text-sm text-gray-500">
                    Cliente: {pedido.consumidor.nomeCompleto}
                  </p>
                  <p className="text-sm text-gray-500">
                    Data: {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Total: R$ {parseFloat(pedido.valorTotal).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Itens neste pedido:</h3>
                <ul className="space-y-2">
                  {pedido.itens.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm text-gray-800">
                      <span>{item.quantidade}x {item.produto.nome}</span>
                      <span>R$ {parseFloat(item.precoUnitarioCompra).toFixed(2).replace('.', ',')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4 flex items-center gap-4">
                <label htmlFor={`status-${pedido.id}`} className="font-semibold text-gray-700">Status do Pedido:</label>
                <select
                  id={`status-${pedido.id}`}
                  value={pedido.statusPedido}
                  onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm"
                >
                  <option value="processando">Processando</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">Você ainda não recebeu nenhum pedido.</p>
        )}
      </div>
    </div>
  );
}