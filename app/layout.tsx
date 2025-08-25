// Caminho: app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'CONECTA RURAL',
  description: 'Conectando o campo à cidade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}