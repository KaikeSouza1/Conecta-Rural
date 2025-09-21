// Caminho: components/Stats.tsx

// Nota: Por enquanto, os números são fixos. No futuro, eles poderiam
// ser buscados do banco de dados para serem dinâmicos.
export function Stats() {
  return (
    <section className="bg-emerald-50 py-12 sm:py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {/* Estatística 1: Produtores */}
          <div>
            <p className="text-4xl font-bold text-emerald-600">250+</p>
            <p className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Produtores
            </p>
          </div>
          {/* Estatística 2: Produtos */}
          <div>
            <p className="text-4xl font-bold text-emerald-600">1.2K+</p>
            <p className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Produtos
            </p>
          </div>
          {/* Estatística 3: Avaliação */}
          <div>
            <p className="text-4xl font-bold text-emerald-600">4.8</p>
            <p className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Avaliação
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}