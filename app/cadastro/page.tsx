

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    fontFamily: 'sans-serif',
  },
  formBox: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '30px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    color: 'white',
    backgroundColor: '#059669',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: '15px',
  },
  link: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#6b7280',
  },
  linkAction: {
    color: '#059669',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default function CadastroPage() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: nomeCompleto,
          email,
          senha,
          cpf_cnpj: cpfCnpj,
          telefone,
          tipo_usuario: 'consumidor',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Cadastro realizado com sucesso! Faça seu login.');
        router.push('/login');
      } else {
        setError(data.error || 'Erro no cadastro');
      }
    } catch (err) { 
      setError('Ocorreu um erro de rede.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>Crie sua Conta</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome Completo"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Telefone (Opcional)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p style={styles.link}>
          Já tem uma conta?{' '}
          <Link href="/login" style={styles.linkAction}>
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}