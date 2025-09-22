// Caminho: app/api/produtos/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Dentro de app/api/produtos/route.ts

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');

    const whereCondition: any = { ativo: true };
    if (categoriaId) {
      whereCondition.categoriaId = parseInt(categoriaId);
    }

    const produtos = await prisma.produto.findMany({
      where: whereCondition,
      include: {
        vendedor: {
          select: { nomeNegocio: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    const produtosSeguros = produtos.map((produto) => ({
      ...produto,
      id: produto.id.toString(),
      vendedorId: produto.vendedorId.toString(),
      categoriaId: produto.categoriaId?.toString() ?? null,
      preco: produto.preco.toString(),
    }));

    return NextResponse.json(produtosSeguros);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = payload.usuarioId as string;
    const tipoUsuario = payload.tipoUsuario as string;

    if (tipoUsuario !== 'vendedor') {
      return NextResponse.json({ error: 'Apenas vendedores podem cadastrar produtos.' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, descricao, preco, unidade_medida, estoque, imagem_url, categoria_id } = body;
    
    if (!nome || preco === undefined || !unidade_medida) {
        return NextResponse.json({ error: 'Nome, preço e unidade de medida são obrigatórios.'}, { status: 400 });
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco,
        unidadeMedida: unidade_medida,
        estoque,
        imagemUrl: imagem_url,
        vendedorId: BigInt(usuarioId),
        categoriaId: categoria_id,
      },
    });

    const produtoSeguro = {
      ...novoProduto,
      id: novoProduto.id.toString(),
      vendedorId: novoProduto.vendedorId.toString(),
      categoriaId: novoProduto.categoriaId?.toString() ?? null,
      preco: novoProduto.preco.toString(),
    };

    return NextResponse.json(produtoSeguro, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar produto.' }, { status: 500 });
  }
}