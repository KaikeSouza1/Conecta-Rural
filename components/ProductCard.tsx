// Caminho: components/ProductCard.tsx
'use client';

import Link from 'next/link';

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

export function ProductCard({ produto }: { produto: Produto }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="aspect-w-3 aspect-h-4 bg-gray-200 sm:aspect-none h-48">
        <img
          src={produto.imagemUrl || '/placeholder.png'}
          alt={`Imagem de ${produto.nome}`}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-lg font-bold text-gray-900">
          <Link href={`/produtos/${produto.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {produto.nome}
          </Link>
        </h3>
        <p className="text-sm text-gray-500">
          {produto.vendedor.nomeNegocio || 'Vendedor Local'}
        </p>
        <div className="flex flex-1 flex-col justify-end">
          <p className="text-xl font-semibold text-emerald-600">
            R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
            <span className="text-sm font-normal text-gray-500"> / {produto.unidadeMedida}</span>
          </p>
        </div>
      </div>
    </div>
  );
}