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
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  
  // ... (outros estados como nomeNegocio, logradouro, etc., continuam aqui)
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [descricaoNegocio, setDescricaoNegocio] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
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
    if (response.ok) setEnderecos(await response.json());
  }, []);
  
  useEffect(() => {
    if (!isAuthLoading && user) {
        setNomeNegocio(user.nomeNegocio || '');
        setDescricaoNegocio(user.descricaoNegocio || '');
        fetchEnderecos();
    }
  }, [user, isAuthLoading, fetchEnderecos]);
  
  // --- NOVA FUNÇÃO PARA EXCLUIR ENDEREÇO ---
  async function handleAddressDelete(enderecoId: string) {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
    
    const token = Cookies.get('auth_token');
    try {
      const response = await fetch(`/api/enderecos/${enderecoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if(response.ok) {
        setSuccess('Endereço excluído com sucesso!');
        fetchEnderecos(); // Recarrega a lista de endereços
      } else {
        const data = await response.json();
        setError(data.error || 'Falha ao excluir endereço.');
      }
    } catch(err) {
      setError('Erro de rede.');
    }
  }

  // ... (outras funções como handleProfileSubmit, handleCepLookup, handleAddressSubmit)

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">Carregando...</p>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Meu Perfil</h1>
        </header>

        {/* ... (formulário do perfil do vendedor) ... */}

        <div className="mt-12 p-8 bg-gray-50 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800">Meus Endereços</h2>
            <div className="mt-4 border-t border-gray-200 pt-4">
                {enderecos.length > 0 ? enderecos.map(end => (
                    <div key={end.id} className="p-4 mb-2 border rounded-md bg-white flex justify-between items-center">
                        <div>
                            <p className="font-medium">{end.logradouro}, {end.numero}</p>
                            <p className="text-sm text-gray-600">{end.bairro}, {end.cidade} - {end.cep}</p>
                        </div>
                        {/* BOTÕES DE AÇÃO ADICIONADOS */}
                        <div className="flex gap-4">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">Editar</button>
                            <button onClick={() => handleAddressDelete(end.id)} className="text-sm font-medium text-red-600 hover:text-red-500">Excluir</button>
                        </div>
                    </div>
                )) : <p className="text-sm text-gray-500">Nenhum endereço cadastrado.</p>}
            </div>

            {/* ... (formulário de adicionar novo endereço) ... */}
        </div>
      </div>
    </div>
  );
}