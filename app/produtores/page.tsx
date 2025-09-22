import Link from 'next/link';
import prisma from '@/lib/prisma';

interface Produtor {
  id: string;
  nomeNegocio: string | null;
  descricaoNegocio: string | null;
  logoUrl: string | null;
}

async function getProdutores(): Promise<Produtor[]> {
  try {
    const produtores = await prisma.usuario.findMany({
      where: { tipoUsuario: 'vendedor' },
      select: {
        id: true,
        nomeNegocio: true,
        descricaoNegocio: true,
        logoUrl: true,
      },
      orderBy: { nomeNegocio: 'asc' },
    });

    return produtores.map(p => ({ ...p, id: p.id.toString() }));
  } catch (error) {
    console.error("Erro ao buscar produtores:", error);
    return [];
  }
}

export default async function ProdutoresPage() {
  const produtores = await getProdutores();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Nossos Produtores</h1>
          <p className="mt-4 text-lg text-gray-500">
            Conheça quem produz os alimentos e produtos artesanais que chegam até você.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {produtores.length > 0 ? (
            produtores.map((produtor) => (
              <div key={produtor.id} className="text-center p-6 border rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <img
                  className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 object-cover"
                  src={produtor.logoUrl || '/placeholder-logo.png'}
                  alt={`Logo de ${produtor.nomeNegocio}`}
                />
                <h2 className="text-xl font-bold text-gray-800">{produtor.nomeNegocio}</h2>
                <p className="mt-2 text-gray-600 text-sm h-20 overflow-hidden">{produtor.descricaoNegocio || 'Produtor local de União da Vitória.'}</p>
                <div className="mt-4">
                  <Link href={`/produtores/${produtor.id}`} className="font-semibold text-emerald-600 hover:text-emerald-500">
                    Ver produtos &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">Nenhum produtor cadastrado no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}
