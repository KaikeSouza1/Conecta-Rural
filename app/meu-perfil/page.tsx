// Caminho: app/meu-perfil/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Endereco {
  id: string; logradouro: string; numero: string | null; bairro: string; cidade: string; cep: string;
}

export default function MeuPerfilPage() {
  const { user, isAuthLoading, refetchUser } = useAuth();
  const router = useRouter();

  // Estados do perfil do VENDEDOR
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [descricaoNegocio, setDescricaoNegocio] = useState('');
  const [logo, setLogo] = useState<File | null>(null);

  // Estados para ENDEREÇOS
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('União da Vitória');
  const [estado, setEstado] = useState('PR');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchEnderecos = useCallback(async () => {
    const token = Cookies.get('auth_token');
    if (!token) return;
    const response = await fetch('/api/enderecos', { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) {
      setEnderecos(await response.json());
    }
  }, []);
  
  useEffect(() => {
    if (!isAuthLoading && user) {
        setNomeNegocio(user.nomeNegocio || '');
        setDescricaoNegocio(user.descricaoNegocio || '');
        fetchEnderecos();
    }
  }, [user, isAuthLoading, fetchEnderecos]);

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    let logoUrl = user?.logoUrl || '';

    if (logo) {
      try {
        const formData = new FormData();
        formData.append('file', logo);
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'Falha no upload do logo.');
        logoUrl = uploadData.url;
      } catch (err: any) {
        setError(err.message);
        setIsSubmitting(false);
        return;
      }
    }

    const token = Cookies.get('auth_token');
    try {
      const response = await fetch('/api/usuarios/meu-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nomeNegocio, descricaoNegocio, logoUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Perfil do negócio atualizado com sucesso!');
        await refetchUser();
      } else {
        setError(data.error || 'Falha ao atualizar o perfil.');
      }
    } catch (err) {
      setError('Ocorreu um erro de rede.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCepLookup() {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) {
        setError('CEP não encontrado.');
      } else {
        setError(null);
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      }
    } catch (err) {
      setError('Erro ao buscar CEP.');
    }
  }
  
  async function handleAddressSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    const token = Cookies.get('auth_token');
    try {
      const response = await fetch('/api/enderecos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ logradouro, numero, bairro, cep, cidade, estado }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Endereço adicionado com sucesso!');
        fetchEnderecos();
        setLogradouro(''); setNumero(''); setBairro(''); setCep(''); setCidade('União da Vitória'); setEstado('PR');
      } else {
        setError(data.error || 'Falha ao adicionar endereço.');
      }
    } catch (err) {
      setError('Ocorreu um erro de rede.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">Carregando...</p>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Meu Perfil</h1>
          <p className="mt-2 text-lg text-gray-500">Atualize suas informações.</p>
        </header>

        {/* FORMULÁRIO DO VENDEDOR QUE ESTAVA FALTANDO */}
        {user.tipoUsuario === 'vendedor' && (
          <form onSubmit={handleProfileSubmit} className="mt-8 p-8 bg-gray-50 rounded-lg shadow space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Informações do Negócio</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="nomeNegocio" className="block text-sm font-medium text-gray-700">Nome do Negócio/Sítio</label>
                  <input type="text" id="nomeNegocio" value={nomeNegocio} onChange={(e) => setNomeNegocio(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="descricaoNegocio" className="block text-sm font-medium text-gray-700">Descrição do Negócio</label>
                  <textarea id="descricaoNegocio" value={descricaoNegocio} onChange={(e) => setDescricaoNegocio(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo</label>
                  {user.logoUrl && <img src={user.logoUrl} alt="Logo atual" className="w-24 h-24 rounded-full object-cover my-2" />}
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) setLogo(e.target.files[0]); }} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                {isSubmitting ? 'Salvando...' : 'Salvar Informações do Negócio'}
              </button>
            </div>
          </form>
        )}

        {/* SEÇÃO DE ENDEREÇOS */}
        <div className="mt-12 p-8 bg-gray-50 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800">Meus Endereços</h2>
            <div className="mt-4 border-t border-gray-200 pt-4">
                {enderecos.length > 0 ? enderecos.map(end => (
                    <div key={end.id} className="p-4 mb-2 border rounded-md bg-white flex justify-between items-center">
                        <div>
                            <p className="font-medium">{end.logradouro}, {end.numero}</p>
                            <p className="text-sm text-gray-600">{end.bairro}, {end.cidade} - {end.cep}</p>
                        </div>
                        <div className="flex gap-4">
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-500">Editar</button>
                          <button className="text-sm font-medium text-red-600 hover:text-red-500">Excluir</button>
                        </div>
                    </div>
                )) : <p className="text-sm text-gray-500">Nenhum endereço cadastrado.</p>}
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 border-t border-gray-200 pt-6">Adicionar Novo Endereço</h3>
            <form onSubmit={handleAddressSubmit} className="mt-6 space-y-4">
              <input type="text" placeholder="CEP" value={cep} onChange={e => setCep(e.target.value)} onBlur={handleCepLookup} required className="block w-full rounded-md border-gray-300 shadow-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Logradouro (Rua, Av.)" value={logradouro} onChange={e => setLogradouro(e.target.value)} required className="sm:col-span-2 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="text" placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} required className="sm:col-span-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="text" placeholder="UF" value={estado} onChange={e => setEstado(e.target.value)} required className="block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <input type="text" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} required className="block w-full rounded-md border-gray-300 shadow-sm" />
              {error && <p className="text-center text-sm text-red-600 mb-2">{error}</p>}
              {success && <p className="text-center text-sm text-green-600 mb-2">{success}</p>}
              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                  {isSubmitting ? 'Salvando Endereço...' : 'Salvar Endereço'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}