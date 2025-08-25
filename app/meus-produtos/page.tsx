'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function MeusProdutosPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('unidade');
  const [estoque, setEstoque] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.tipoUsuario !== 'vendedor') {
      router.push('/');
    }
  }, [user, isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = Cookies.get('auth_token');

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nome,
          descricao: descricao,
          preco: parseFloat(preco),
          unidade_medida: unidadeMedida,
          estoque: parseInt(estoque, 10),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Produto cadastrado com sucesso!');
        setNome('');
        setDescricao('');
        setPreco('');
        setEstoque('');
      } else {
        setError(data.error || 'Falha ao cadastrar o produto.');
      }
    } catch (err) {
      setError('Ocorreu um erro de rede. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || user.tipoUsuario !== 'vendedor') {
    return <p>Acesso negado. Redirecionando...</p>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Painel do Vendedor</h1>
          <p>Bem-vindo, {user.nomeCompleto}.</p>
        </div>
        <Link href="/" style={{ color: 'blue' }}>Voltar para a Página Inicial</Link>
      </header>
      
      <hr style={{ margin: '20px 0' }} />

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h2>Cadastrar Novo Produto</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Nome do Produto:</label><br />
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label>Descrição:</label><br />
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '80px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label>Preço (R$):</label><br />
            <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label>Unidade de Medida:</label><br />
            <select value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
              <option value="unidade">Unidade</option>
              <option value="kg">Kg</option>
              <option value="litro">Litro</option>
              <option value="duzia">Dúzia</option>
              <option value="bandeja">Bandeja</option>
            </select>
          </div>
          <div>
            <label>Estoque (unidades):</label><br />
            <input type="number" step="1" value={estoque} onChange={(e) => setEstoque(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

          <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '5px' }}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}