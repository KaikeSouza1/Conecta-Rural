// Caminho: app/produtos/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext'; // 1. Importar o hook do carrinho

// ... (interfaces e estilos existentes)
interface Vendedor { nomeNegocio: string | null; }
interface Produto { id: string; nome: string; descricao: string | null; preco: string; unidadeMedida: string; estoque: number | null; imagemUrl: string | null; vendedor: Vendedor; }

export default function ProdutoDetalhePage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart(); // 2. Pegar a função addToCart do contexto

  const [produto, setProduto] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduto() {
      if (!id) return;
      try {
        const response = await fetch(`/api/produtos/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado.');
        const data = await response.json();
        setProduto(data);
      } catch (err) {
        setError('Não foi possível carregar o produto.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduto();
  }, [id]);

  // 3. Função para lidar com o clique no botão
  function handleAddToCart() {
    if (produto) {
      addToCart({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagemUrl: produto.imagemUrl,
      });
    }
  }

  if (isLoading) return <div className="text-center py-10"><p>Carregando produto...</p></div>;
  if (error || !produto) return <div className="text-center py-10"><p className="text-red-600">{error || 'Produto não encontrado.'}</p></div>;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Coluna da Imagem */}
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={produto.imagemUrl || '/placeholder.png'} alt={`Imagem de ${produto.nome}`} className="h-full w-full object-cover object-center" />
          </div>
          {/* Coluna de Informações */}
          <div className="flex flex-col h-full">
            <Link href="/loja" className="text-sm text-emerald-600 hover:underline mb-4">&larr; Voltar para a loja</Link>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{produto.nome}</h1>
            <div className="mt-3"><p className="text-lg text-gray-500">Vendido por: <span className="font-semibold text-gray-700">{produto.vendedor.nomeNegocio || 'Vendedor Local'}</span></p></div>
            <div className="mt-6"><p className="text-3xl tracking-tight text-emerald-600">R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}<span className="text-lg font-normal text-gray-500"> / {produto.unidadeMedida}</span></p></div>
            <div className="mt-6 space-y-4 text-base text-gray-700"><p>{produto.descricao || 'Este produto não tem uma descrição detalhada.'}</p></div>
            <div className="mt-8"><p className="text-sm text-gray-600">{produto.estoque ? `${produto.estoque} unidades em estoque` : 'Produto sob encomenda'}</p></div>
            <div className="mt-auto pt-8">
               <button
                  onClick={handleAddToCart} // 4. Conectar a função ao botão
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-emerald-600 px-8 py-3 text-base font-medium text-white hover:bg-emerald-700"
                >
                  Adicionar ao carrinho
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}