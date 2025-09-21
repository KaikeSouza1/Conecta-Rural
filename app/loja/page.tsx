// Caminho: app/loja/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard'; // Importa nosso novo componente

// Tipos de dados
interface Vendedor {
  nomeNegocio: string | null;
}
interface Produto {
  id: string;
  nome: string;
  preco: string;
  unidadeMedida: string;
  vendedor: Vendedor;
  imagemUrl: string | null;
}

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const response = await fetch('/api/produtos');
        if (!response.ok) {
          throw new Error('Falha ao buscar produtos.');
        }
        const data = await response.json();
        setProdutos(data);
      } catch (err) {
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProdutos();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Nossos Produtos</h1>
          <p className="mt-4 text-lg text-gray-500">
            Encontre o melhor da produção local, direto da terra para sua casa.
          </p>
        </div>

        <div className="pt-12">
          {produtos.length > 0 ? (
            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">Nenhum produto cadastrado no momento. Volte em breve!</p>
          )}
        </div>
      </div>
    </div>
  );
}