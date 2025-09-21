// Caminho: app/sobre/page.tsx

export default function SobrePage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-center">
            Sobre o Conecta Rural
          </h1>
          <p className="mt-6 text-xl text-gray-600 text-center">
            Nascemos com o propósito de fortalecer a agricultura familiar e conectar o campo à cidade na região de União da Vitória.
          </p>

          <div className="mt-12 space-y-8 text-gray-700">
            <div className="p-6 bg-emerald-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-emerald-800">Nossa Missão</h2>
              <p className="mt-4">
                Desenvolver uma plataforma digital acessível que promova a ligação direta entre agricultores, comerciantes e consumidores. Queremos simplificar a venda de produtos agroindustriais e artesanais, estimulando a economia local e valorizando quem produz.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800">Nossa Visão</h2>
              <p className="mt-4">
                Ser a principal referência de tecnologia e inovação para o agronegócio familiar na nossa região, criando um ecossistema onde a produção local é valorizada, o consumo é consciente e a comunidade prospera de forma sustentável e conectada.
              </p>
            </div>
          </div>

          {/* NOVA SEÇÃO ADICIONADA AQUI */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Nossa Equipe</h2>
            <p className="mt-4 text-gray-600">
              Este projeto foi desenvolvido por:
            </p>
            <p className="mt-2 text-lg font-medium text-emerald-700">
              Kaike Souza, Ramon Rocha, Luan Zahn & Jehniffer Tracz
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}