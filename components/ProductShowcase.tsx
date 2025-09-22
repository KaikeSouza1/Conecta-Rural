// Caminho: components/ProductShowcase.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';

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

const cardStyles = [
  { transform: 'rotate(-6deg) translate(-30%, 5%) scale(0.9)', zIndex: 10, opacity: 0.8, filter: 'brightness(0.9)' },
  { transform: 'rotate(2deg) scale(1)', zIndex: 20, opacity: 1 },
  { transform: 'rotate(8deg) translate(30%, 10%) scale(0.9)', zIndex: 10, opacity: 0.8, filter: 'brightness(0.9)' },
];

export function ProductShowcase() {
  const [allProdutos, setAllProdutos] = useState<Produto[]>([]);
  const [visibleProdutos, setVisibleProdutos] = useState<Produto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Falha ao buscar produtos');
        const data = await response.json();
        setAllProdutos(data);
      } catch (error) {
        console.error('Erro ao carregar produtos para a vitrine:', error);
      }
    }
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (allProdutos.length === 0) return;
    const updateVisibleProducts = (startIndex: number) => {
      const newVisible = [];
      for (let i = 0; i < 3; i++) {
        const productIndex = (startIndex + i) % allProdutos.length;
        if (allProdutos[productIndex]) {
          newVisible.push(allProdutos[productIndex]);
        }
      }
      setVisibleProdutos(newVisible);
    };

    // Define os produtos iniciais
    updateVisibleProducts(currentIndex);

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % allProdutos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allProdutos, currentIndex]);

  return (
    <div className="relative h-96 flex items-center justify-center -mr-24">
      {allProdutos.length === 0 && <div className="text-gray-500">Carregando vitrine...</div>}
      
      {visibleProdutos.map((produto, index) => (
        <div
          key={`${produto.id}-${currentIndex}`}
          className="absolute w-64 bg-white rounded-lg shadow-2xl p-4 transition-all duration-1000 ease-in-out"
          style={cardStyles[index]}
        >
          <div className="w-full h-32 bg-gray-200 rounded-md mb-3">
            <img
              src={produto.imagemUrl || '/placeholder.png'}
              alt={`Imagem de ${produto.nome}`}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <h3 className="font-semibold text-gray-800 truncate">{produto.nome}</h3>
          <p className="text-sm text-gray-500 truncate">{produto.vendedor.nomeNegocio || 'Vendedor Local'}</p>
          <p className="mt-2 font-bold text-emerald-600">
            R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')} / {produto.unidadeMedida}
          </p>
        </div>
      ))}
    </div>
  );
}