// Caminho: app/produtores/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

interface Produto {
  id: string;
  nome: string;
  preco: string;
  unidadeMedida: string;
  imagemUrl: string | null;
  vendedor: { nomeNegocio: string | null; };
}
interface Produtor {
  id: string;
  nomeNegocio: string | null;
  descricaoNegocio: string | null;
  logoUrl: string | null;
  produtos: Produto[];
}

export default function ProdutorPage() {
  const params = useParams();
  const id = params.id as string;
  const [produtor, setProdutor] = useState<Produtor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchProdutor() {
      try {
        // CORREÇÃO IMPORTANTE: A API correta para buscar um produtor é /api/produtores/[id]
        const response = await fetch(`/api/produtores/${id}`);
        if (!response.ok) {
          throw new Error('Produtor não encontrado.');
        }
        setProdutor(await response.json());
      } catch (err) {
        setError('Não foi possível carregar as informações do produtor.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProdutor();
  }, [id]);

  if (isLoading) return <div className="text-center py-10">Carregando perfil do produtor...</div>;
  if (error || !produtor) return <div className="text-center py-10 text-red-600">{error || 'Produtor não encontrado.'}</div>;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-gray-200">
          <img
            className="w-40 h-40 rounded-full object-cover bg-gray-200 shadow-lg"
            src={produtor.logoUrl || '/placeholder-logo.png'}
            alt={`Logo de ${produtor.nomeNegocio}`}
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{produtor.nomeNegocio}</h1>
            <p className="mt-4 text-lg text-gray-600">{produtor.descricaoNegocio || 'Produtor local dedicado a trazer o melhor do campo para você.'}</p>
          </div>
        </div>

        <div className="pt-12">
          <h2 className="text-2xl font-bold text-gray-800">Produtos deste produtor</h2>
          <div className="mt-6 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {produtor.produtos.length > 0 ? (
              produtor.produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">Este produtor ainda não cadastrou produtos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}