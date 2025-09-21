// Caminho: components/Hero.tsx

'use client'; // Necessário para usar o hook useAuth

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // 1. Importar o hook de autenticação

export function Hero() {
  const { isAuthenticated } = useAuth(); // 2. Obter o status de login

  return (
    <div className="text-center md:text-left">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-4">
        Compre diretamente do produtor rural
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Produtos frescos, artesanais e com preço justo da região de União da Vitória.
      </p>
      <div className="flex justify-center md:justify-start space-x-4">
        <Link
          href="/loja"
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
        >
          Explorar Produtos
        </Link>
        
        {/* 3. CONDIÇÃO: Só mostra o botão se o usuário NÃO estiver autenticado */}
        {!isAuthenticated && (
          <Link
            href="/cadastro"
            className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full shadow-lg hover:bg-gray-300 transition-transform transform hover:scale-105"
          >
            Sou Produtor
          </Link>
        )}
      </div>
    </div>
  );
}