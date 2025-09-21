// Caminho: app/meus-produtos/novo/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function NovoProdutoPage() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  // A CORREÇÃO ESTÁ AQUI: Adicionando o '=' em todas as linhas do useState
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('unidade');
  const [estoque, setEstoque] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.tipoUsuario !== 'vendedor')) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    let imageUrl = '';

    if (imagem) {
      try {
        const formData = new FormData();
        formData.append('file', imagem);
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'Falha no upload da imagem.');
        imageUrl = uploadData.url;
      } catch (err: any) {
        setError(err.message);
        setIsSubmitting(false);
        return;
      }
    }

    const token = Cookies.get('auth_token');
    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, descricao, preco: parseFloat(preco), unidade_medida: unidadeMedida, estoque: parseInt(estoque, 10), imagem_url: imageUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Produto cadastrado com sucesso! Redirecionando...');
        setTimeout(() => router.push('/meus-produtos'), 2000);
      } else {
        setError(data.error || 'Falha ao cadastrar o produto.');
      }
    } catch (err) {
      setError('Ocorreu um erro de rede.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || !user) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="pb-8 border-b border-gray-200">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Adicionar Novo Produto</h1>
                <p className="mt-4 text-lg text-gray-500">
                    Preencha os detalhes abaixo para colocar um novo item à venda na sua loja.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-12 max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                        <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                    </div>
                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                    </div>
                    <div>
                        <label htmlFor="imagem" className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
                        <input type="file" id="imagem" accept="image/*" onChange={(e) => { if (e.target.files) setImagem(e.target.files[0]); }} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                            <input type="number" id="preco" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                        </div>
                        <div>
                            <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700">Unidade de Medida</label>
                            <select id="unidadeMedida" value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                                <option value="unidade">Unidade</option><option value="kg">Kg</option><option value="litro">Litro</option><option value="duzia">Dúzia</option><option value="bandeja">Bandeja</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="estoque" className="block text-sm font-medium text-gray-700">Estoque (unidades)</label>
                        <input type="number" id="estoque" step="1" value={estoque} onChange={(e) => setEstoque(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-gray-200">
                    {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
                    {success && <p className="text-center text-sm text-green-600 mb-4">{success}</p>}
                    <div className="flex justify-end gap-3">
                        <Link href="/meus-produtos" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            Cancelar
                        </Link>
                        <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">
                            {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
  );
}