// Caminho: app/pagamento/[pedidoId]/page.tsx

import { Suspense } from 'react';
import PaymentPageClient from './PaymentPageClient';

// Este é o componente que será mostrado enquanto os dados da URL carregam
function LoadingSpinner() {
  return (
    <main className="container mx-auto px-4 py-8 text-center">
      <p className="text-gray-700 text-xl">Carregando informações de pagamento...</p>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentPageClient />
    </Suspense>
  );
}