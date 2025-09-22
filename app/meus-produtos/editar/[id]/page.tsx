// Caminho: app/meus-produtos/editar/[id]/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Categoria {
  id: number;
  nome: string;
}

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('unidade');
  const [estoque, setEstoque] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string | number>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const catResponse = await fetch('/api/categorias');
        if (catResponse.ok) setCategorias(await catResponse.json());

        const prodResponse = await fetch(`/api/produtos/${id}`);
        if (prodResponse.ok) {
          const data = await prodResponse.json();
          setNome(data.nome);
          setDescricao(data.descricao || '');
          setPreco(data.preco);
          setUnidadeMedida(data.unidadeMedida);
          setEstoque(data.estoque?.toString() || '');
          setAtivo(data.ativo);
          setCategoriaId(data.categoriaId || '');
        } else {
          setError('Produto não encontrado.');
        }
      } catch (err) {
        setError('Erro de rede ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchData();
    }
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    const token = Cookies.get('auth_token');

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nome,
          descricao,
          preco: parseFloat(preco),
          unidade_medida: unidadeMedida,
          estoque: parseInt(estoque, 10),
          ativo,
          categoria_id: categoriaId ? parseInt(String(categoriaId), 10) : null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Produto atualizado com sucesso! Redirecionando...');
        setTimeout(() => router.push('/meus-produtos'), 2000);
      } else {
        setError(data.error || 'Falha ao atualizar o produto.');
      }
    } catch (err) {
      setError('Ocorreu um erro de rede.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="text-center py-10">Carregando produto...</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <header className="pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Editar Produto</h1>
        </header>
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300"/>
          </div>
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select id="categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300">
              <option value="">Selecione uma categoria</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300"/>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
              <input type="number" id="preco" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300"/>
            </div>
            <div>
              <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700">Unidade</label>
              <select id="unidadeMedida" value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300">
                <option value="unidade">Unidade</option><option value="kg">Kg</option><option value="litro">Litro</option><option value="duzia">Dúzia</option><option value="bandeja">Bandeja</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="estoque" className="block text-sm font-medium text-gray-700">Estoque</label>
            <input type="number" id="estoque" step="1" value={estoque} onChange={(e) => setEstoque(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300"/>
          </div>
          <div className="flex items-center">
            <input id="ativo" type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600"/>
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">Produto Ativo</label>
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Link href="/meus-produtos" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</Link>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}