// Caminho: components/Footer.tsx

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} CONECTA RURAL. Todos os direitos reservados.</p>
        <p className="mt-2 text-sm">
          Desenvolvido por Kaike Souza, Ramon Rocha, Luan Zahn & Jehniffer Tracz
        </p>
      </div>
    </footer>
  );
}