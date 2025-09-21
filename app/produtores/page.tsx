// Caminho: app/produtores/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Produtor {
  id: string;
  nomeNegocio: string | null;
  descricaoNegocio: string | null;
  logoUrl: string | null;
}

export default function ProdutoresPage() {
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProdutores() {
      try {
        const response = await fetch('/api/produtores');
        if (!response.ok) {
          throw new Error('Falha ao buscar a lista de produtores.');
        }
        const data = await response.json();
        setProdutores(data);
      } catch (err) {
        setError('Não foi possível carregar os produtores.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProdutores();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Carregando produtores...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Nossos Produtores</h1>
          <p className="mt-4 text-lg text-gray-500">
            Conheça quem produz os alimentos e produtos artesanais que chegam até você.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {produtores.length > 0 ? (
            produtores.map((produtor) => (
              <div key={produtor.id} className="text-center p-6 border rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <img
                  className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 object-cover"
                  src={produtor.logoUrl || '/placeholder-logo.png'}
                  alt={`Logo de ${produtor.nomeNegocio}`}
                />
                <h2 className="text-xl font-bold text-gray-800">{produtor.nomeNegocio}</h2>
                <p className="mt-2 text-gray-600 text-sm h-20 overflow-hidden">{produtor.descricaoNegocio || 'Produtor local de União da Vitória.'}</p>
                <div className="mt-4">
                  {/* Este link ainda não vai funcionar, mas já deixaremos preparado */}
                  <Link href={`/produtores/${produtor.id}`} className="font-semibold text-emerald-600 hover:text-emerald-500">
                    Ver produtos &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum produtor cadastrado no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}