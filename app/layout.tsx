// Caminho: app/layout.tsx

'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/Header'; // 1. Importar o Header

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Header /> {/* 2. Adicionar o Header aqui */}
            <main>{children}</main> {/* O conteúdo da página fica aqui */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}