'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Produto {
  id: string;
  nome: string;
  preco: string; 
  estoque: number | null;
  imagemUrl: string | null;
  ativo: boolean | null;
}

export default function MeusProdutosPage() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeusProdutos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = Cookies.get('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/produtos/meus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setProdutos(data);
      } else {
        setError(data.error || 'Falha ao carregar seus produtos.');
      }
    } catch (err) {
      setError('Erro de rede ao carregar produtos.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.tipoUsuario !== 'vendedor')) {
      router.push('/');
      return;
    }
    if (!isAuthLoading && user && user.tipoUsuario === 'vendedor') {
      fetchMeusProdutos();
    }
  }, [user, isAuthLoading, router, fetchMeusProdutos]);

  const handleDeleteProduto = async (produtoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    const token = Cookies.get('auth_token');
    try {
      const response = await fetch(`/api/produtos/${produtoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert('Produto excluído com sucesso!');
        fetchMeusProdutos();
      } else {
        const data = await response.json();
        alert(`Erro ao excluir produto: ${data.error}`);
      }
    } catch (err) {
      alert('Erro de rede ao excluir produto.');
    }
  };

  if (isAuthLoading || !user) {
    return <div className="text-center py-10 text-gray-700">Carregando...</div>;
  }
  
  if (user.tipoUsuario !== 'vendedor') {
     return <div className="text-center py-10 text-red-600">Acesso negado.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10 text-gray-700">Carregando seus produtos...</div>;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Meus Produtos</h1>
          {/* O link para adicionar novo produto será criado em breve */}
          <Link href="/meus-produtos/novo" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700">
            Adicionar Novo Produto
          </Link>
        </div>

        {error && <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.length > 0 ? (
            produtos.map((produto) => (
              <div key={produto.id} className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-48">
                  <img src={produto.imagemUrl || '/placeholder.png'} alt={`Imagem de ${produto.nome}`} className="h-full w-full object-cover object-center" />
                </div>
                <div className="p-4 flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link href={`/meus-produtos/editar/${produto.id}`}><span aria-hidden="true" className="absolute inset-0" />{produto.nome}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Estoque: {produto.estoque}</p>
                  
                  {/* CORREÇÃO 2: Usando parseFloat() */}
                  <p className="text-xl font-bold text-gray-900 mt-2">R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link href={`/meus-produtos/editar/${produto.id}`} className="z-10 relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Editar
                    </Link>
                    <button onClick={() => handleDeleteProduto(produto.id)} className="z-10 relative inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">Você ainda não cadastrou nenhum produto.</p>
          )}
        </div>
      </div>
    </div>
  );
}