// Caminho: app/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Objeto para organizar os estilos e não poluir o JSX
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6', // Um cinza claro de fundo
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
    boxSizing: 'border-box', // Garante que o padding não aumente a largura total
  },
  button: {
    width: '100%',
    padding: '12px',
    color: 'white',
    backgroundColor: '#059669', // Um tom de verde
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  error: {
    color: '#ef4444', // Vermelho
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (response.ok) {
        await login(data.token);
        router.push('/');
      } else {
        setError(data.error || 'Falha no login.');
      }
    } catch (error) {
      setError('Ocorreu um erro de rede. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>Acessar sua Conta</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.link}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" style={styles.linkAction}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}