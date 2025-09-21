// Caminho: components/ProductShowcase.tsx
'use client';

import { useEffect, useState } from 'react';

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

// Estilos pré-definidos para as 3 posições dos cards
const cardStyles = [
  { transform: 'rotate(-6deg) translate(-30%, 5%) scale(0.9)', zIndex: 10, filter: 'brightness(0.9)' },
  { transform: 'rotate(2deg) scale(1)', zIndex: 20 },
  { transform: 'rotate(8deg) translate(30%, 10%) scale(0.9)', zIndex: 10, filter: 'brightness(0.9)' },
];

export function ProductShowcase() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [indices, setIndices] = useState([0, 1, 2]); // Ordem inicial dos cards

  // Efeito para buscar os produtos da API
  useEffect(() => {
    async function fetchProdutos() {
      try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Falha ao buscar produtos');
        const data = await response.json();
        setProdutos(data.slice(0, 3)); // Pegamos os 3 primeiros
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    }
    fetchProdutos();
  }, []);

  // Efeito para animar os cards a cada 3 segundos
  useEffect(() => {
    if (produtos.length < 2) return; // Não anima se tiver menos de 2 produtos

    const interval = setInterval(() => {
      setIndices(prevIndices => {
        // Rotaciona o array de índices: [0, 1, 2] -> [1, 2, 0] -> [2, 0, 1] ...
        const newIndices = [...prevIndices];
        const first = newIndices.shift()!;
        newIndices.push(first);
        return newIndices;
      });
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao sair da página
  }, [produtos.length]);

  return (
    <div className="relative h-96 flex items-center justify-center -mr-24">
      {produtos.length === 0 && <div className="text-gray-500">Nenhum produto na vitrine.</div>}
      
      {produtos.map((produto, index) => (
        <div
          key={produto.id}
          className="absolute w-64 bg-white rounded-lg shadow-2xl p-4 transition-all duration-700 ease-in-out"
          style={cardStyles[indices[index]] || { display: 'none' }}
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