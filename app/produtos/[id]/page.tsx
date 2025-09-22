// Caminho: app/produtos/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Vendedor { nomeNegocio: string | null; }
interface Produto { id: string; nome: string; descricao: string | null; preco: string; unidadeMedida: string; estoque: number | null; imagemUrl: string | null; vendedor: Vendedor; }

export default function ProdutoDetalhePage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart, cartItems } = useCart();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
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

  // --- LÓGICA DE VALIDAÇÃO DE ESTOQUE ROBUSTA ---
  const itemNoCarrinho = cartItems.find(item => item.id === produto?.id);
  const quantidadeNoCarrinho = itemNoCarrinho?.quantidade || 0;
  const estoqueDisponivel = produto?.estoque ?? Infinity; // Se o estoque for nulo, consideramos infinito
  const estoqueRealDisponivel = estoqueDisponivel - quantidadeNoCarrinho;

  const handleAddToCart = () => {
    if (!produto) return;

    // Verifica se a quantidade a ser adicionada é maior que o estoque real disponível
    if (quantidade > estoqueRealDisponivel) {
      alert(`Operação não permitida. A quantidade desejada (${quantidade}) é maior que o estoque disponível (${estoqueRealDisponivel}).`);
      // Ajusta a quantidade para o máximo disponível
      setQuantidade(estoqueRealDisponivel > 0 ? estoqueRealDisponivel : 1);
      return;
    }
    if (quantidade < 1) {
        alert('Por favor, adicione pelo menos 1 item.');
        return;
    }
    addToCart(produto, quantidade);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = parseInt(e.target.value, 10);
    if (isNaN(valor) || valor < 1) {
        valor = 1;
    }
    // Impede que o valor digitado ultrapasse o estoque
    if (valor > estoqueRealDisponivel) {
        valor = estoqueRealDisponivel;
    }
    setQuantidade(valor);
  }
  
  // --- FIM DA LÓGICA ---

  if (isLoading) return <div className="text-center py-10"><p>Carregando produto...</p></div>;
  if (error || !produto) return <div className="text-center py-10"><p className="text-red-600">{error || 'Produto não encontrado.'}</p></div>;

  const produtoEsgotado = estoqueRealDisponivel <= 0;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={produto.imagemUrl || '/placeholder.png'} alt={`Imagem de ${produto.nome}`} className="h-full w-full object-cover object-center" />
          </div>
          <div className="flex flex-col h-full">
            <Link href="/loja" className="text-sm text-emerald-600 hover:underline mb-4">&larr; Voltar para a loja</Link>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{produto.nome}</h1>
            <div className="mt-3"><p className="text-lg text-gray-500">Vendido por: <span className="font-semibold text-gray-700">{produto.vendedor.nomeNegocio || 'Vendedor Local'}</span></p></div>
            <div className="mt-6"><p className="text-3xl tracking-tight text-emerald-600">R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}<span className="text-lg font-normal text-gray-500"> / {produto.unidadeMedida}</span></p></div>
            <div className="mt-6 space-y-4 text-base text-gray-700"><p>{produto.descricao || 'Este produto não tem uma descrição detalhada.'}</p></div>
            <div className="mt-8">
              <p className="text-sm text-gray-600">
                {produtoEsgotado ? (
                  <span className="text-red-600 font-semibold">Produto Esgotado</span>
                ) : (
                  // Mostra o estoque real disponível, já descontando o que está no carrinho
                  `Disponível: ${estoqueRealDisponivel} unidades`
                )}
              </p>
            </div>
            <div className="mt-auto pt-8 flex items-center gap-4">
              <div>
                <label htmlFor="quantidade" className="sr-only">Quantidade</label>
                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  // O valor máximo que o usuário pode selecionar é o estoque real disponível
                  max={estoqueRealDisponivel} 
                  value={quantidade}
                  onChange={handleQuantityChange}
                  disabled={produtoEsgotado}
                  className="w-20 rounded-md border border-gray-300 py-2.5 text-center"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={produtoEsgotado || quantidade > estoqueRealDisponivel}
                className="flex-1 flex w-full items-center justify-center rounded-md border border-transparent bg-emerald-600 px-8 py-3 text-base font-medium text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {produtoEsgotado ? 'Esgotado' : 'Adicionar ao carrinho'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}