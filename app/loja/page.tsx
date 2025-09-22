// Caminho: app/loja/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProductCard } from '@/components/ProductCard';

// Tipos de dados
interface Categoria {
  id: number;
  nome: string;
}
interface Produto { /* ... (interface existente) */ id: string; nome: string; preco: string; unidadeMedida: string; imagemUrl: string | null; vendedor: { nomeNegocio: string | null; }; }

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os produtos, agora com filtro opcional
  const fetchProdutos = useCallback(async (catId: number | null) => {
    setIsLoading(true);
    let url = '/api/produtos';
    if (catId) {
      url += `?categoriaId=${catId}`;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao buscar produtos.');
      setProdutos(await response.json());
    } catch (err) {
      setError('Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca as categorias e os produtos iniciais
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const catResponse = await fetch('/api/categorias');
        if (catResponse.ok) setCategorias(await catResponse.json());
      } catch (error) {
        console.error("Falha ao carregar categorias", error);
      }
      fetchProdutos(null); // Carrega todos os produtos inicialmente
    }
    fetchInitialData();
  }, [fetchProdutos]);
  
  const handleCategoryClick = (catId: number | null) => {
    setCategoriaSelecionada(catId);
    fetchProdutos(catId);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Nossos Produtos</h1>
          <p className="mt-4 text-lg text-gray-500">
            Encontre o melhor da produção local, direto da terra para sua casa.
          </p>
        </div>

        {/* SEÇÃO DE FILTROS DE CATEGORIA */}
        <div className="pt-8 flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 text-sm font-medium rounded-full ${categoriaSelecionada === null ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full ${categoriaSelecionada === cat.id ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        <div className="pt-12">
          {isLoading ? (
            <p className="text-center text-gray-600">Carregando...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {produtos.length > 0 ? (
                produtos.map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">Nenhum produto encontrado nesta categoria.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}