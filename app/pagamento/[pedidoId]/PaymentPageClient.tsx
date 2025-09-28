// Caminho: app/pagamento/[pedidoId]/PaymentPageClient.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface QrCode {
  text: string;
  href: string;
}

export default function PaymentPageClient() {
  const searchParams = useSearchParams();
  const [qrCodeData, setQrCodeData] = useState<QrCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qrCodeText = searchParams.get('qrCodeText');
    const qrCodeLink = searchParams.get('qrCodeLink');
    
    if (qrCodeText && qrCodeLink) {
      setQrCodeData({
        text: decodeURIComponent(qrCodeText),
        href: decodeURIComponent(qrCodeLink),
      });
    } else {
      setError('Dados de pagamento inválidos. Por favor, tente refazer o pedido a partir do carrinho.');
    }
  }, [searchParams]);

  const handleCopyPix = () => {
    if (qrCodeData?.text) {
      navigator.clipboard.writeText(qrCodeData.text);
      alert('Código Pix Copiado!');
    }
  };

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Erro no Pagamento</h1>
        <p className="text-gray-700">{error}</p>
        <Link href="/carrinho" className="mt-6 inline-block bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700">
          Voltar para o Carrinho
        </Link>
      </main>
    );
  }

  // Enquanto qrCodeData não estiver pronto, o Suspense vai mostrar o "Carregando..."
  if (!qrCodeData) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Finalize seu Pagamento</h1>
        <p className="text-gray-600 mb-6">Escaneie o QR Code abaixo com o app do seu banco para pagar via Pix.</p>
        
        <div className="flex justify-center mb-6">
            <img src={qrCodeData.href} alt="QR Code para pagamento Pix" className="w-64 h-64 border rounded-lg" />
        </div>

        <p className="text-gray-600 mb-4">Ou copie o código:</p>
        
        <div className="bg-gray-100 p-3 rounded-lg mb-6">
            <p className="text-gray-800 break-words text-sm">{qrCodeData.text}</p>
        </div>

        <button 
            onClick={handleCopyPix}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition duration-300"
        >
            Copiar Código Pix
        </button>

        <p className="text-sm text-gray-500 mt-8">Após o pagamento, seu pedido será processado. Você pode acompanhar o status em "Meus Pedidos".</p>
         <Link href="/meus-pedidos" className="mt-4 inline-block text-emerald-600 hover:underline">
          Ir para Meus Pedidos
        </Link>
      </div>
    </main>
  );
}