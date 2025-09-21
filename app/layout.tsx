// Caminho: app/layout.tsx

'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer'; // 1. Importar o Footer

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Classes para garantir que o footer fique no final da página
    <html lang="pt-br" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full bg-gray-50`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main> {/* flex-grow faz o conteúdo principal "empurrar" o footer para baixo */}
            <Footer /> {/* 2. Adicionar o Footer aqui */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}