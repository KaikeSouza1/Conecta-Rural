// Caminho: components/Header.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // A CORREÇÃO ESTÁ AQUI: 'menuRef' em vez de 'menu-ref'
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-emerald-600">
          Conecta Rural
        </Link>
        
        <ul className="hidden md:flex items-center space-x-6">
          <li><Link href="/" className="text-gray-600 hover:text-emerald-600">Início</Link></li>
          <li><Link href="/loja" className="text-gray-600 hover:text-emerald-600">Produtos</Link></li>
          <li><Link href="/produtores" className="text-gray-600 hover:text-emerald-600">Produtores</Link></li>
        </ul>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <input type="text" placeholder="Buscar produtos..." className="px-4 py-2 border rounded-full text-sm" />
          </div>
          
          <Link href="/carrinho" className="relative text-gray-600 hover:text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>
          
          <div className="relative" ref={menuRef}>
            {isAuthenticated && user ? (
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            ) : (
              <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-emerald-600">
                  Login
              </Link>
            )}

            {isMenuOpen && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-bold truncate">{user?.nomeCompleto}</p>
                </div>
                <Link href="/meu-perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meu Perfil</Link>
                <Link href="/meus-pedidos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meus Pedidos</Link>
                {user?.tipoUsuario === 'vendedor' && (
                  <Link href="/meus-produtos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Meus Produtos
                  </Link>
                )}
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}