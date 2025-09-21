// Caminho: app/api/produtores/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    const produtor = await prisma.usuario.findUnique({
      where: {
        id: id,
        tipoUsuario: 'vendedor',
      },
      select: {
        id: true,
        nomeNegocio: true,
        descricaoNegocio: true,
        logoUrl: true,
        produtos: {
          where: {
            ativo: true,
          },
          // Selecionamos os campos necessários para o ProductCard
          select: {
            id: true,
            nome: true,
            preco: true,
            unidadeMedida: true,
            imagemUrl: true,
            vendedor: {
                select: { nomeNegocio: true }
            }
          },
        },
      },
    });

    if (!produtor) {
      return NextResponse.json({ error: 'Produtor não encontrado.' }, { status: 404 });
    }

    // Mapeamento para garantir que os dados sejam seguros para JSON
    const safeProdutor = {
        ...produtor,
        id: produtor.id.toString(),
        produtos: produtor.produtos.map(p => ({
            ...p,
            id: p.id.toString(),
            preco: p.preco.toString(),
        }))
    };

    return NextResponse.json(safeProdutor);
  } catch (error) {
    console.error('Erro ao buscar produtor:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do produtor.' }, { status: 500 });
  }
}