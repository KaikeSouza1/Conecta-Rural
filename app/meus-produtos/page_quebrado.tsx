// Caminho: app/api/produtos/[id]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// GET (Buscar um produto) - Sem alteração
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const produto = await prisma.produto.findUnique({ where: { id: BigInt(params.id) } });
    if (!produto) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    
    const produtoSeguro = { ...produto, id: produto.id.toString(), vendedorId: produto.vendedorId.toString(), categoriaId: produto.categoriaId?.toString() ?? null, preco: produto.preco.toString() };
    return NextResponse.json(produtoSeguro);
  } catch (error) {
    return NextResponse.json({ error: 'ID de produto inválido.' }, { status: 400 });
  }
}

// PUT (Atualizar um produto) - Sem alteração
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);
    const id = BigInt(params.id);
    
    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    if (produto.vendedorId !== usuarioId) return NextResponse.json({ error: 'Você não tem permissão para editar este produto.' }, { status: 403 });

    const body = await request.json();
    const { nome, descricao, preco, unidade_medida, estoque, ativo } = body;

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: { nome, descricao, preco, unidadeMedida: unidade_medida, estoque, ativo },
    });
    
    const produtoSeguro = { ...produtoAtualizado, id: produtoAtualizado.id.toString(), vendedorId: produtoAtualizado.vendedorId.toString(), categoriaId: produtoAtualizado.categoriaId?.toString() ?? null, preco: produtoAtualizado.preco.toString() };
    return NextResponse.json(produtoSeguro);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

// DELETE (Deletar um produto) - Sem alteração
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const usuarioId = BigInt(payload.usuarioId as string);
    const id = BigInt(params.id);

    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    if (produto.vendedorId !== usuarioId) return NextResponse.json({ error: 'Você não tem permissão para deletar este produto.' }, { status: 403 });

    await prisma.produto.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2003') {
      return NextResponse.json({ error: 'Não é possível deletar este produto pois ele está associado a pedidos existentes.' }, { status: 409 });
    }
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json({ error: 'Erro ao deletar produto.' }, { status: 500 });
  }
}

// PATCH (Alterar status ativo/inativo) - NOVO!
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const token = request.headers.get('authorization')?.split(' ')[1];
      if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      
      const { payload } = await jwtVerify(token, secret);
      const usuarioId = BigInt(payload.usuarioId as string);
      const id = BigInt(params.id);
      
      const produto = await prisma.produto.findUnique({ where: { id } });
      if (!produto) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
      if (produto.vendedorId !== usuarioId) return NextResponse.json({ error: 'Você não tem permissão para alterar este produto.' }, { status: 403 });
  
      const produtoAtualizado = await prisma.produto.update({
        where: { id },
        data: { ativo: !produto.ativo }, // Inverte o status atual
      });
      
      const produtoSeguro = { ...produtoAtualizado, id: produtoAtualizado.id.toString(), vendedorId: produtoAtualizado.vendedorId.toString(), categoriaId: produtoAtualizado.categoriaId?.toString() ?? null, preco: produtoAtualizado.preco.toString() };
      return NextResponse.json(produtoSeguro);
    } catch (error) {
      console.error("Erro ao alterar status do produto:", error);
      return NextResponse.json({ error: 'Erro ao alterar status do produto.' }, { status: 500 });
    }
  }