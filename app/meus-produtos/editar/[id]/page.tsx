// Caminho: app/meus-produtos/editar/[id]/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

const styles: { [key: string]: React.CSSProperties } = {
  container: { fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  formContainer: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '30px' },
  form: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '5px', fontWeight: 'bold', color: '#333' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  button: { padding: '12px 15px', cursor: 'pointer', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold' },
  message: { textAlign: 'center', padding: '10px', borderRadius: '5px', margin: '10px 0' },
};

export default function EditarProdutoPage() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Pega o ID da URL

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('unidade');
  const [estoque, setEstoque] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProduto = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/produtos/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Preenche o formulário com os dados recebidos da API
        setNome(data.nome);
        setDescricao(data.descricao || '');
        setPreco(data.preco);
        setUnidadeMedida(data.unidadeMedida);
        setEstoque(data.estoque?.toString() || '');
        setAtivo(data.ativo);
      } else {
        setError('Produto não encontrado ou falha ao carregar.');
      }
    } catch (err) {
      setError('Erro de rede ao buscar dados do produto.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Apenas busca os dados se o ID estiver disponível
    if (id) {
      fetchProduto();
    }
  }, [id, fetchProduto]);

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

  if (isLoading) return <p>Carregando dados do produto...</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Editar Produto: {nome || '...'}</h1>
        <Link href="/meus-produtos" style={{ color: 'blue' }}>Voltar para a lista</Link>
      </header>
      <hr style={{ margin: '20px 0' }} />
      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}><label style={styles.label}>Nome do Produto:</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Descrição:</label><textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{...styles.input, minHeight: '80px' }} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Preço (R$):</label><input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Unidade de Medida:</label><select value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)} required style={styles.input}><option value="unidade">Unidade</option><option value="kg">Kg</option><option value="litro">Litro</option><option value="duzia">Dúzia</option><option value="bandeja">Bandeja</option></select></div>
          <div style={styles.inputGroup}><label style={styles.label}>Estoque (unidades):</label><input type="number" step="1" value={estoque} onChange={(e) => setEstoque(e.target.value)} required style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={{ display: 'flex', alignItems: 'center' }}><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} style={{ marginRight: '10px' }} /> Produto Ativo na loja</label></div>
          
          {error && <p style={{...styles.message, backgroundColor: '#fee2e2', color: '#b91c1c'}}>{error}</p>}
          {success && <p style={{...styles.message, backgroundColor: '#dcfce7', color: '#166534'}}>{success}</p>}

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}